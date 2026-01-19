'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTodoStore } from "@/store/use-todo-store"

interface TodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'create' | 'edit'
  todoId?: string
  initialTitle?: string
  initialDescription?: string
}

export function TodoDialog({
  open,
  onOpenChange,
  mode = 'create',
  todoId,
  initialTitle = '',
  initialDescription = '',
}: TodoDialogProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const { addTodo, updateTodo } = useTodoStore()

  useEffect(() => {
    if (open) {
      setTitle(initialTitle)
      setDescription(initialDescription)
    }
  }, [open, initialTitle, initialDescription])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    // Optimistic Update: Close immediately
    onOpenChange(false)

    if (mode === 'create') {
      addTodo(title, description)
    } else if (mode === 'edit' && todoId) {
      updateTodo(todoId, title, description)
    }
    
    // Reset form after close
    setTimeout(() => {
        setTitle('')
        setDescription('')
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Todo' : 'Edit Todo'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? "Add a new task to your list. Click save when you're done." 
              : "Make changes to your task here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Groceries"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Buy milk and eggs..."
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
