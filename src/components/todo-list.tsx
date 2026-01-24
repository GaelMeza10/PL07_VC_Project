'use client'

import { useEffect, useState } from "react"
import { useTodoStore, Todo, List } from "@/store/use-todo-store"
import { TodoCard } from "./todo-card"
import { TodoDialog } from "./todo-dialog"
import { DeleteAlert } from "./delete-alert"
import { CreateListDialog } from "./create-list-dialog"
import { RenameListDialog } from "./rename-list-dialog"
import { Button } from "./ui/button"
import { Plus, ChevronDown, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TodoListProps {
  initialTodos: unknown[]
  initialLists: unknown[]
}

export function TodoList({ initialTodos = [], initialLists = [] }: TodoListProps) {
  const storeTodos = useTodoStore((state) => state.todos)
  const storeLists = useTodoStore((state) => state.lists)
  const activeListId = useTodoStore((state) => state.activeListId)
  const setActiveList = useTodoStore((state) => state.setActiveList)
  const { deleteTodo, deleteList, sync } = useTodoStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    sync()
    
    const handleOnline = () => {
       console.log("Back online, syncing...")
       sync()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [sync])

  // Hydration fix
  const todos = isClient ? storeTodos : (initialTodos as Todo[])
  const lists = isClient ? storeLists : (initialLists as List[])
  
  // Filter todos by active list
  const filteredTodos = activeListId ? todos.filter(t => t.listId === activeListId) : []
  const activeList = lists.find(l => l.id === activeListId)
  
  // Auto-select first list if none selected
  useEffect(() => {
    if (isClient && !activeListId && lists.length > 0) {
      setActiveList(lists[0].id)
    }
  }, [isClient, activeListId, lists, setActiveList])
  
  // Dialog states
  const [isCreateListOpen, setIsCreateListOpen] = useState(false)
  const [isCreateTodoOpen, setIsCreateTodoOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null)
  const [renamingList, setRenamingList] = useState<{ id: string, name: string } | null>(null)
  const [deletingList, setDeletingList] = useState<{ id: string, name: string } | null>(null)

  const handleDeleteTodoConfirm = () => {
    if (deletingTodo) {
      deleteTodo(deletingTodo.id)
      setDeletingTodo(null)
    }
  }

  const handleDeleteListConfirm = () => {
    if (deletingList) {
      deleteList(deletingList.id)
      setDeletingList(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: List Selector + List Options */}
        <div className="flex items-center gap-2">
          {/* Show skeleton during hydration if server returned empty */}
          {!isClient && initialLists.length === 0 ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-10" />
            </div>
          ) : lists.length > 0 ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
                    <span className="truncate">{activeList?.name || "Select List"}</span>
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[180px]">
                  {lists.map((list) => (
                    <DropdownMenuItem 
                      key={list.id}
                      onClick={() => setActiveList(list.id)}
                    >
                      {list.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* List Options Menu */}
              {activeList && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setRenamingList({ id: activeList.id, name: activeList.name })}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename list
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => setDeletingList({ id: activeList.id, name: activeList.name })}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete list
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          ) : (
            <h2 className="text-2xl font-bold">No Lists</h2>
          )}
        </div>

        {/* Right: Create List + Create Todo buttons */}
        <div className="flex items-center gap-2">
          {!isClient && initialLists.length === 0 ? (
            <Skeleton className="h-10 w-[120px]" />
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsCreateListOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Create List
              </Button>
              {lists.length > 0 && (
                <Button onClick={() => setIsCreateTodoOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Create Todo
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Todos Grid */}
      {!isClient && initialLists.length === 0 ? (
        // Show skeleton during hydration if server returned empty
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[150px] w-full rounded-xl" />
          ))}
        </div>
      ) : lists.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTodos.map((todo) => (
            <TodoCard 
              key={todo.id} 
              todo={todo} 
              onEdit={setEditingTodo} 
              onDelete={setDeletingTodo} 
            />
          ))}
          {filteredTodos.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
              <p>No tasks in this list yet. Create one to get started!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
          <p>Create a list to start organizing your tasks!</p>
        </div>
      )}

      {/* Dialogs */}
      <CreateListDialog open={isCreateListOpen} onOpenChange={setIsCreateListOpen} />
      
      {renamingList && (
        <RenameListDialog 
          open={!!renamingList} 
          onOpenChange={(open) => !open && setRenamingList(null)}
          listId={renamingList.id}
          currentName={renamingList.name}
        />
      )}

      <DeleteAlert 
        open={!!deletingList}
        onOpenChange={(open) => !open && setDeletingList(null)}
        onConfirm={handleDeleteListConfirm}
        title="Delete list?"
        description={deletingList ? `Are you sure you want to delete "${deletingList.name}"? All tasks in this list will also be deleted.` : ""}
      />

      <TodoDialog 
        open={isCreateTodoOpen} 
        onOpenChange={setIsCreateTodoOpen} 
        mode="create" 
      />

      <TodoDialog 
        open={!!editingTodo} 
        onOpenChange={(open) => !open && setEditingTodo(null)} 
        mode="edit" 
        todoId={editingTodo?.id}
        initialTitle={editingTodo?.title}
        initialDescription={editingTodo?.description}
        initialStatus={editingTodo?.status}
        initialCategory={editingTodo?.category}
        initialPriority={editingTodo?.priority}
      />

      <DeleteAlert 
        open={!!deletingTodo} 
        onOpenChange={(open) => !open && setDeletingTodo(null)} 
        onConfirm={handleDeleteTodoConfirm} 
      />
    </div>
  )
}
