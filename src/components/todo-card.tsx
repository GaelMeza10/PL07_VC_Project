'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { Todo } from "@/store/use-todo-store"
import { memo } from "react"

interface TodoCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

const statusColors = {
  'Pending': 'bg-gray-500',
  'Todo': 'bg-blue-500',
  'In Progress': 'bg-yellow-500',
  'Completed': 'bg-green-500',
}

const categoryColors = {
  'Bug': 'bg-red-500',
  'Feature': 'bg-purple-500',
  'Docs': 'bg-cyan-500',
  'Improvement': 'bg-indigo-500',
  'Refactor': 'bg-orange-500',
}

const priorityColors = {
  'Minor': 'bg-slate-400',
  'Normal': 'bg-blue-400',
  'Important': 'bg-amber-500',
  'Critical': 'bg-red-600',
}

export const TodoCard = memo(function TodoCard({ todo, onEdit, onDelete }: TodoCardProps) {
  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1 pr-4 flex-1">
          <CardTitle className="text-xl font-semibold leading-none tracking-tight">
            {todo.title}
          </CardTitle>
          {todo.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {todo.description}
            </p>
          )}
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
      
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2">
          <Badge className={`${statusColors[todo.status]} text-white`}>
            {todo.status}
          </Badge>
          <Badge className={`${categoryColors[todo.category]} text-white`}>
            {todo.category}
          </Badge>
          <Badge className={`${priorityColors[todo.priority]} text-white`}>
            {todo.priority}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground pt-0">
         {new Date(todo.createdAt).toLocaleDateString('en-GB')}
         {!todo.isSynced && <span className="ml-2 text-yellow-600">(Unsynced)</span>}
      </CardFooter>
    </Card>
  )
})
