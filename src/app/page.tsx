import { Header } from "@/components/header";
import { TodoList } from "@/components/todo-list";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import TodoModel from "@/models/Todo";
import ListModel from "@/models/List";

async function getData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { lists: [], todos: [] };

  const user = await verifyToken(token);
  if (!user) return { lists: [], todos: [] };

  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('DB Timeout')), 1500)
    );

    const dbPromise = (async () => {
      await connectDB();
      const [lists, todos] = await Promise.all([
        ListModel.find({ userId: user.userId as string }).sort({ createdAt: 1 }).lean(),
        TodoModel.find({ userId: user.userId as string }).sort({ createdAt: -1 }).lean()
      ]);
      return { lists, todos };
    })();

    const { lists, todos } = await Promise.race([dbPromise, timeoutPromise]);

    return {
      lists: lists.map((list: any) => ({
        ...list,
        _id: list._id.toString(),
        id: list.id,
        name: list.name,
        userId: list.userId,
        createdAt: list.createdAt,
        isSynced: true
      })),
      todos: todos.map((todo: any) => ({
        ...todo,
        _id: todo._id.toString(),
        id: todo.id,
        listId: todo.listId,
        title: todo.title,
        description: todo.description,
        createdAt: todo.createdAt,
        userId: todo.userId,
        isSynced: true
      }))
    };
  } catch (e) {
    if (e instanceof Error && e.message === 'DB Timeout') {
      // Silent fallback
    } else {
      console.error("Server-side fetch failed:", e);
    }
    return { lists: [], todos: [] };
  }
}

export default async function Home() {
  const { lists, todos } = await getData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
            <p className="text-muted-foreground">View, filter, and manage all your project tasks in one place</p>
          </div>
          {/* @ts-ignore */}
          <TodoList initialTodos={todos} initialLists={lists} />
        </div>
      </main>
    </div>
  );
}
