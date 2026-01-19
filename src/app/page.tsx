import { Header } from "@/components/header";
import { TodoList } from "@/components/todo-list";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import TodoModel from "@/models/Todo";

async function getTodos() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return [];

  const user = await verifyToken(token);
  if (!user) return [];

  try {
      // Create a timeout promise (e.g., 1500ms) to prevent hanging if DB is unreachable
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('DB Timeout')), 1500)
      );

      const dbPromise = (async () => {
          await connectDB();
          return TodoModel.find({ userId: user.userId as string })
            .sort({ createdAt: -1 })
            .lean();
      })();

      // Race against the timeout
      const todos = (await Promise.race([dbPromise, timeoutPromise])) as any[];

      return todos.map(todo => ({
        ...todo,
        _id: todo._id.toString(),
        id: todo.id,
        title: todo.title,
        description: todo.description,
        createdAt: todo.createdAt,
        userId: todo.userId,
        isSynced: true
      }));
  } catch (e) {
      if (e instanceof Error && e.message === 'DB Timeout') {
          // Expected behavior when offline - silent fallback
      } else {
          console.error("Server-side fetch failed:", e);
      }
      return [];
  }
}

export default async function Home() {
  const initialTodos = await getTodos();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Manage your tasks efficiently.</p>
            </div>
            {/* @ts-ignore - TodoList is client component but passed data is valid */}
            <TodoList initialTodos={initialTodos} />
        </div>
      </main>
    </div>
  );
}
