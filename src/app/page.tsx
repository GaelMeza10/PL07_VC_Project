import { TodoList } from "@/components/todo-list";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">My Fast Todo</h1>
            <p className="text-muted-foreground">High performance, offline-first task management</p>
        </header>
        <TodoList />
      </div>
    </main>
  );
}
