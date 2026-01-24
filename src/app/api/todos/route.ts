import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Todo from '@/models/Todo'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

async function getUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null
    
    const payload = await verifyToken(token)
    return payload // { userId, email, name, ... }
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    // Scope to userId
    const todos = await Todo.find({ userId: user.userId as string }).sort({ createdAt: -1 })
    
    return NextResponse.json(todos)
  } catch (error) {
    console.error("GET /api/todos failed:", error)
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      
    await connectDB()
    const body = await request.json()
    
    // Upsert logic with userId scope
    // Try to create. If ID exists (and belongs to user?), error.
    // However, for sync, we might want to check existence.
    // To keep it simple per "best practices": 
    // We create. If collision, we catch. But since IDs are UUIDs, collision is rare.
    // The main protection is: we assume the user OWNS the item they are creating.
    
    const todo = await Todo.create({
        id: body.id,
        userId: user.userId as string,
        listId: body.listId,
        title: body.title,
        description: body.description,
        status: body.status || 'Todo',
        category: body.category || 'Feature',
        priority: body.priority || 'Normal',
        createdAt: body.createdAt || Date.now()
    })
    
    return NextResponse.json(todo)
  } catch (error) {
    // If error is duplicate key on 'id', we might want to handle it.
    console.error("POST /api/todos failed:", error)
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
    try {
        const user = await getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const body = await request.json()
        const { id, title, description, listId, status, category, priority } = body
        
        const updateFields: any = { title, description }
        if (listId) updateFields.listId = listId
        if (status) updateFields.status = status
        if (category) updateFields.category = category
        if (priority) updateFields.priority = priority
        
        const todo = await Todo.findOneAndUpdate(
            { id: id, userId: user.userId as string }, 
            updateFields, 
            { new: true }
        )
        
        if (!todo) {
             // Try to create (Upsert) if not found?
             // Only if we trust the client to have the right data. 
             // Logic in store tries POST first then PUT. So we just return 404 here.
             return NextResponse.json({ error: 'Todo not found or unauthorized' }, { status: 404 })
        }
        return NextResponse.json(todo)
  } catch (error) {
    console.error("PUT /api/todos failed:", error)
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
    try {
        const user = await getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await connectDB()
        const body = await request.json()
        const { id } = body
        
        // Scope delete to userId
        await Todo.findOneAndDelete({ id: id, userId: user.userId as string })
        
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("DELETE /api/todos failed:", error)
        return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
    }
}
