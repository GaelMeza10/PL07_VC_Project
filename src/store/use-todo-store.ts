import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'

export interface Todo {
  id: string
  title: string
  description: string
  createdAt: number
  isSynced: boolean
  updatedAt?: number
}

interface TodoState {
  todos: Todo[]
  deletedIds: string[] // Track IDs that need to be deleted from server
  addTodo: (title: string, description: string) => Promise<void>
  updateTodo: (id: string, title: string, description: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  sync: () => Promise<void>
}

const SYNC_API_URL = '/api/todos'

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      deletedIds: [],

      addTodo: async (title, description) => {
        const newTodo: Todo = {
          id: uuidv4(),
          title,
          description,
          createdAt: Date.now(),
          isSynced: false,
        }
        
        // INSTANT UI UPDATE
        set((state) => ({ todos: [newTodo, ...state.todos] }))

        // Trigger background sync only if online
        if (navigator.onLine) {
            toast.success("Todo created")
            get().sync()
        } else {
             toast.warning("Created locally. Reload/Reconnect to sync.")
        }
      },

      updateTodo: async (id, title, description) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, title, description, isSynced: false, updatedAt: Date.now() } : todo
          ),
        }))
        toast.success("Todo updated")
        
        if (navigator.onLine) {
            get().sync()
        }
      },

      deleteTodo: async (id) => {
        set((state) => ({
          // Remove from list
          todos: state.todos.filter((todo) => todo.id !== id),
          // Add to deleted queue to sync later
          deletedIds: [...state.deletedIds, id] 
        }))
        toast.success("Todo deleted")

        if (navigator.onLine) {
            get().sync()
        }
      },

      sync: async () => {
        const state = get()
        // Snapshot ids to ensuring we don't revive them if server returns them in race condition
        const idsToDelete = [...state.deletedIds]
        
        // 1. Push Deletions
        if (idsToDelete.length > 0) {
            await Promise.all(idsToDelete.map(async (id) => {
                try {
                    await fetch(SYNC_API_URL, {
                        method: 'DELETE',
                        body: JSON.stringify({ id })
                    })
                    // Remove from actual state after success
                    set((prev) => ({ deletedIds: prev.deletedIds.filter(dId => dId !== id) }))
                } catch (e) {
                    console.error("Failed to sync delete for", id)
                }
            }))
        }

        // 2. Push Creations / Updates
        const unsyncedTodos = state.todos.filter(t => !t.isSynced)
        if (unsyncedTodos.length > 0) {
            await Promise.all(unsyncedTodos.map(async (todo) => {
                try {
                   let res = await fetch(SYNC_API_URL, {
                       method: 'POST', 
                       body: JSON.stringify(todo)
                   })
                   
                   if (!res.ok) {
                       res = await fetch(SYNC_API_URL, {
                           method: 'PUT',
                           body: JSON.stringify(todo)
                       })
                   }
                   
                   if (res.ok) {
                       set((prev) => ({
                           todos: prev.todos.map(t => t.id === todo.id ? { ...t, isSynced: true } : t)
                       }))
                   }
                } catch (e) {
                    console.error("Failed to sync todo", todo.id)
                }
            }))
        }

        // 3. Pull / Merge from Server
        try {
            const res = await fetch(SYNC_API_URL)
            if (res.ok) {
                const serverTodos: Todo[] = await res.json()
                
                set((prev) => {
                    const localMap = new Map(prev.todos.map(t => [t.id, t]))
                    // Use the SNAPSHOT + current state to ensure we block deleted items
                    // Even if we just cleared it from state, we know we just tried to delete it.
                    const deletedSet = new Set([...prev.deletedIds, ...idsToDelete])
                    
                    const mergedTodos = [...prev.todos]
                    
                    serverTodos.forEach(serverTodo => {
                        if (deletedSet.has(serverTodo.id)) return // Don't revive deleted items
                        
                        const localTodo = localMap.get(serverTodo.id)
                        if (!localTodo) {
                            // New from server
                            mergedTodos.push({ ...serverTodo, isSynced: true })
                        } else if (localTodo.isSynced) {
                            // Update local with server if local doesn't have pending changes
                            // (If local isSynced=true, we accept server truth)
                             const index = mergedTodos.findIndex(t => t.id === serverTodo.id)
                             if (index !== -1) {
                                 mergedTodos[index] = { ...serverTodo, isSynced: true }
                             }
                        }
                    })
                    
                     const serverIdSet = new Set(serverTodos.map(t => t.id))
                     const finalTodos = mergedTodos.filter(t => {
                         // Keep if unsynced (new local)
                         if (!t.isSynced) return true
                         // Keep if exists on server
                         if (serverIdSet.has(t.id)) return true
                         // Keep if it was locally created and server just hasn't seen it yet?
                         // If it's isSynced=true BUT not in serverSet, it means it was deleted on server.
                         // So we should remove it.
                         return false
                     })
                     
                     finalTodos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

                     return { todos: finalTodos }
                })
            }
        } catch (e) {
            console.error("Fetch failed in sync", e)
        }
      }
    }),
    {
      name: 'todo-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
