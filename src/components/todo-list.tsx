'use client'

import { useEffect, useState } from "react"
import { useTodoStore, Todo } from "@/store/use-todo-store"
import { TodoCard } from "./todo-card"
import { TodoDialog } from "./todo-dialog"
import { DeleteAlert } from "./delete-alert"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

export function TodoList() {
  const todos = useTodoStore((state) => state.todos)
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null)
  const { deleteTodo, sync } = useTodoStore()

  // Sync on mount
  useEffect(() => {
    sync()
    
    const handleOnline = () => {
       console.log("Back online, syncing...")
       sync()
    }
    
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [sync])

  const handleDeleteConfirm = () => {
    if (deletingTodo) {
      deleteTodo(deletingTodo.id)
      setDeletingTodo(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tasks ({todos.length})</h2>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create Todo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {todos.map((todo) => (
          <TodoCard 
            key={todo.id} 
            todo={todo} 
            onEdit={setEditingTodo} 
            onDelete={setDeletingTodo} 
          />
        ))}
        {todos.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                <p>No tasks yet. Create one to get started!</p>
            </div>
        )}
      </div>

      <TodoDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        mode="create" 
      />

      <TodoDialog 
        open={!!editingTodo} 
        onOpenChange={(open) => !open && setEditingTodo(null)} 
        mode="edit" 
        todoId={editingTodo?.id}
        initialTitle={editingTodo?.title}
        initialDescription={editingTodo?.description}
      />

      <DeleteAlert 
        open={!!deletingTodo} 
        onOpenChange={(open) => !open && setDeletingTodo(null)} 
        onConfirm={handleDeleteConfirm} 
      />
    </div>
  )
}
