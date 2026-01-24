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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTodoStore } from "@/store/use-todo-store"

interface TodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'create' | 'edit'
  todoId?: string
  initialTitle?: string
  initialDescription?: string
  initialStatus?: string
  initialCategory?: string
  initialPriority?: string
}

export function TodoDialog({
  open,
  onOpenChange,
  mode = 'create',
  todoId,
  initialTitle = '',
  initialDescription = '',
  initialStatus = 'Todo',
  initialCategory = 'Feature',
  initialPriority = 'Normal',
}: TodoDialogProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [status, setStatus] = useState(initialStatus)
  const [category, setCategory] = useState(initialCategory)
  const [priority, setPriority] = useState(initialPriority)
  const { addTodo, updateTodo } = useTodoStore()

  useEffect(() => {
    if (open) {
      setTitle(initialTitle)
      setDescription(initialDescription)
      setStatus(initialStatus)
      setCategory(initialCategory)
      setPriority(initialPriority)
    }
  }, [open, initialTitle, initialDescription, initialStatus, initialCategory, initialPriority])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onOpenChange(false)

    if (mode === 'create') {
      addTodo(title, description, status, category, priority)
    } else if (mode === 'edit' && todoId) {
      updateTodo(todoId, title, description, status, category, priority)
    }
    
    setTimeout(() => {
      setTitle('')
      setDescription('')
      setStatus('Todo')
      setCategory('Feature')
      setPriority('Normal')
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Todo' : 'Edit Todo'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? "Add a new task to your list." 
              : "Make changes to your task."}
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
              placeholder="Task title..."
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
              placeholder="Task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Todo">Todo</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug">Bug</SelectItem>
                <SelectItem value="Feature">Feature</SelectItem>
                <SelectItem value="Docs">Docs</SelectItem>
                <SelectItem value="Improvement">Improvement</SelectItem>
                <SelectItem value="Refactor">Refactor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Minor">Minor</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Important">Important</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
