'use client'

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTodoStore } from "@/store/use-todo-store"

interface CreateListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateListDialog({ open, onOpenChange }: CreateListDialogProps) {
  const [name, setName] = useState("")
  const addList = useTodoStore((state) => state.addList)

  const handleSubmit = () => {
    if (!name.trim()) return
    
    addList(name.trim())
    setName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new list</DialogTitle>
          <DialogDescription>
            Organize your tasks into lists
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
           onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
