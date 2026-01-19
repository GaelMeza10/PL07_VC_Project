'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react" // Icons
import { Todo } from "@/store/use-todo-store"
import { memo } from "react"

interface TodoCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

export const TodoCard = memo(function TodoCard({ todo, onEdit, onDelete }: TodoCardProps) {
  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 pr-4">
          <CardTitle className="text-xl font-semibold leading-none tracking-tight">
            {todo.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {todo.description}
          </CardDescription>
        </div>
        <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onEdit(todo)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(todo)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>
        </div>
      </CardHeader>
      <CardFooter className="text-xs text-muted-foreground pt-2">
         Created: {new Date(todo.createdAt).toLocaleDateString('en-GB')}
         {!todo.isSynced && <span className="ml-2 text-yellow-600">(Unsynced)</span>}
      </CardFooter>
    </Card>
  )
})
