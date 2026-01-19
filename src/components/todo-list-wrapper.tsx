'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"

export const TodoListWrapper = dynamic(() => import("./todo-list").then(mod => mod.TodoList), { 
  ssr: false,
  loading: () => (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[150px] w-full rounded-xl" />
            ))}
        </div>
      </div>
  )
})
