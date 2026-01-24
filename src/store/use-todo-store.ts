import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'

export interface List {
  id: string
  name: string
  createdAt: number
  isSynced: boolean
  updatedAt?: number
}

export interface Todo {
  id: string
  listId: string
  title: string
  description: string
  status: 'Pending' | 'Todo' | 'In Progress' | 'Completed'
  category: 'Bug' | 'Feature' | 'Docs' | 'Improvement' | 'Refactor'
  priority: 'Minor' | 'Normal' | 'Important' | 'Critical'
  createdAt: number
  isSynced: boolean
  updatedAt?: number
}

interface TodoState {
  lists: List[]
  todos: Todo[]
  activeListId: string | null
  deletedIds: string[]
  deletedListIds: string[]
  
  addList: (name: string) => Promise<void>
  updateList: (id: string, name: string) => Promise<void>
  deleteList: (id: string) => Promise<void>
  setActiveList: (id: string | null) => void
  
  addTodo: (title: string, description: string, status: string, category: string, priority: string) => Promise<void>
  updateTodo: (id: string, title: string, description: string, status: string, category: string, priority: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  
  sync: () => Promise<void>
}

const TODOS_API = '/api/todos'
const LISTS_API = '/api/lists'

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      lists: [],
      todos: [],
      activeListId: null,
      deletedIds: [],
      deletedListIds: [],

      addList: async (name) => {
        const { activeListId } = get()
        const newList: List = {
          id: uuidv4(),
          name,
          createdAt: Date.now(),
          isSynced: false,
        }
        
        set((state) => ({ 
          lists: [...state.lists, newList],
          activeListId: activeListId || newList.id
        }))

        if (navigator.onLine) {
          toast.success("List created")
          get().sync()
        } else {
          toast.warning("List saved locally. Reconnect to sync.")
        }
      },

      updateList: async (id, name) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === id ? { ...list, name, isSynced: false, updatedAt: Date.now() } : list
          ),
        }))
        toast.success("List renamed")
        
        if (navigator.onLine) {
          get().sync()
        }
      },

      deleteList: async (id) => {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== id),
          todos: state.todos.filter((todo) => todo.listId !== id),
          deletedListIds: [...state.deletedListIds, id],
          activeListId: state.activeListId === id ? null : state.activeListId
        }))
        toast.success("List deleted")

        if (navigator.onLine) {
          get().sync()
        }
      },

      setActiveList: (id) => {
        set({ activeListId: id })
      },

      addTodo: async (title, description, status, category, priority) => {
        const { activeListId } = get()
        if (!activeListId) {
          toast.error("Please select a list first")
          return
        }

        const newTodo: Todo = {
          id: uuidv4(),
          listId: activeListId,
          title,
          description,
          status: status as any,
          category: category as any,
          priority: priority as any,
          createdAt: Date.now(),
          isSynced: false,
        }
        
        set((state) => ({ todos: [newTodo, ...state.todos] }))

        if (navigator.onLine) {
          toast.success("Todo created")
          get().sync()
        } else {
          toast.warning("Created locally. Reload/Reconnect to sync.")
        }
      },

      updateTodo: async (id, title, description, status, category, priority) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { 
              ...todo, 
              title, 
              description, 
              status: status as any,
              category: category as any,
              priority: priority as any,
              isSynced: false, 
              updatedAt: Date.now() 
            } : todo
          ),
        }))
        toast.success("Todo updated")
        
        if (navigator.onLine) {
          get().sync()
        }
      },

      deleteTodo: async (id) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
          deletedIds: [...state.deletedIds, id] 
        }))
        toast.success("Todo deleted")

        if (navigator.onLine) {
          get().sync()
        }
      },

      sync: async () => {
        const state = get()
        const listIdsToDelete = [...state.deletedListIds]
        const todoIdsToDelete = [...state.deletedIds]
        
        // === SYNC LISTS ===
        
        // 1. Push List Deletions
        if (listIdsToDelete.length > 0) {
          await Promise.all(listIdsToDelete.map(async (id) => {
            try {
              await fetch(LISTS_API, {
                method: 'DELETE',
                body: JSON.stringify({ id })
              })
              set((prev) => ({ deletedListIds: prev.deletedListIds.filter(dId => dId !== id) }))
            } catch (e) {
              console.error("Failed to sync list delete for", id)
            }
          }))
        }

        // 2. Push List Creations / Updates
        const unsyncedLists = state.lists.filter(l => !l.isSynced)
        if (unsyncedLists.length > 0) {
          await Promise.all(unsyncedLists.map(async (list) => {
            try {
              let res = await fetch(LISTS_API, {
                method: 'POST', 
                body: JSON.stringify(list)
              })
              
              if (!res.ok) {
                res = await fetch(LISTS_API, {
                  method: 'PUT',
                  body: JSON.stringify(list)
                })
              }
              
              if (res.ok) {
                set((prev) => ({
                  lists: prev.lists.map(l => l.id === list.id ? { ...l, isSynced: true } : l)
                }))
              }
            } catch (e) {
              console.error("Failed to sync list", list.id)
            }
          }))
        }

        // 3. Pull / Merge Lists from Server
        try {
          const res = await fetch(LISTS_API)
          if (res.ok) {
            const serverLists: List[] = await res.json()
            
            set((prev) => {
              const localMap = new Map(prev.lists.map(l => [l.id, l]))
              const deletedSet = new Set([...prev.deletedListIds, ...listIdsToDelete])
              
              const mergedLists = [...prev.lists]
              
              serverLists.forEach(serverList => {
                if (deletedSet.has(serverList.id)) return
                
                const localList = localMap.get(serverList.id)
                if (!localList) {
                  mergedLists.push({ ...serverList, isSynced: true })
                } else if (localList.isSynced) {
                  const index = mergedLists.findIndex(l => l.id === serverList.id)
                  if (index !== -1) {
                    mergedLists[index] = { ...serverList, isSynced: true }
                  }
                }
              })
              
              const serverIdSet = new Set(serverLists.map(l => l.id))
              const finalLists = mergedLists.filter(l => {
                if (!l.isSynced) return true
                if (serverIdSet.has(l.id)) return true
                return false
              })
              
              finalLists.sort((a, b) => a.createdAt - b.createdAt)

              return { lists: finalLists }
            })
          }
        } catch (e) {
          console.error("Fetch lists failed in sync", e)
        }

        // === SYNC TODOS ===
        
        // 4. Push Todo Deletions
        if (todoIdsToDelete.length > 0) {
          await Promise.all(todoIdsToDelete.map(async (id) => {
            try {
              await fetch(TODOS_API, {
                method: 'DELETE',
                body: JSON.stringify({ id })
              })
              set((prev) => ({ deletedIds: prev.deletedIds.filter(dId => dId !== id) }))
            } catch (e) {
              console.error("Failed to sync todo delete for", id)
            }
          }))
        }

        // 5. Push Todo Creations / Updates
        const unsyncedTodos = state.todos.filter(t => !t.isSynced)
        if (unsyncedTodos.length > 0) {
          await Promise.all(unsyncedTodos.map(async (todo) => {
            try {
              let res = await fetch(TODOS_API, {
                method: 'POST', 
                body: JSON.stringify(todo)
              })
              
              if (!res.ok) {
                res = await fetch(TODOS_API, {
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

        // 6. Pull / Merge Todos from Server
        try {
          const res = await fetch(TODOS_API)
          if (res.ok) {
            const serverTodos: Todo[] = await res.json()
            
            set((prev) => {
              const localMap = new Map(prev.todos.map(t => [t.id, t]))
              const deletedSet = new Set([...prev.deletedIds, ...todoIdsToDelete])
              
              const mergedTodos = [...prev.todos]
              
              serverTodos.forEach(serverTodo => {
                if (deletedSet.has(serverTodo.id)) return
                
                const localTodo = localMap.get(serverTodo.id)
                if (!localTodo) {
                  mergedTodos.push({ ...serverTodo, isSynced: true })
                } else if (localTodo.isSynced) {
                  const index = mergedTodos.findIndex(t => t.id === serverTodo.id)
                  if (index !== -1) {
                    mergedTodos[index] = { ...serverTodo, isSynced: true }
                  }
                }
              })
              
              const serverIdSet = new Set(serverTodos.map(t => t.id))
              const finalTodos = mergedTodos.filter(t => {
                if (!t.isSynced) return true
                if (serverIdSet.has(t.id)) return true
                return false
              })
              
              finalTodos.sort((a, b) => b.createdAt - a.createdAt)

              return { todos: finalTodos }
            })
          }
        } catch (e) {
          console.error("Fetch todos failed in sync", e)
        }
      }
    }),
    {
      name: 'todo-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
