'use client'

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTodoStore } from "@/store/use-todo-store"

interface RenameListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listId: string
  currentName: string
}

export function RenameListDialog({ open, onOpenChange, listId, currentName }: RenameListDialogProps) {
  const [name, setName] = useState(currentName)
  const updateList = useTodoStore((state) => state.updateList)

  const handleSubmit = () => {
    if (!name.trim() || name.trim() === currentName) {
      onOpenChange(false)
      return
    }
    
    updateList(listId, name.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename list</DialogTitle>
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
