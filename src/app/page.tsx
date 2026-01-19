import { Header } from "@/components/header";
import { TodoListWrapper } from "@/components/todo-list-wrapper";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Manage your tasks efficiently.</p>
            </div>
            <TodoListWrapper />
        </div>
      </main>
    </div>
  );
}
