import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Todo from '@/models/Todo'

export async function GET() {
  try {
    await connectDB()
    const todos = await Todo.find({}).sort({ createdAt: -1 })
    // Map _id to id for frontend compatibility if needed, though frontend currently generates IDs locally. 
    // Ideally we should sync these. For this hybrid approach:
    // We return the DB todos. The frontend store might need adjustment if we want true sync.
    // However, the current "offline-first" store uses UUIDs.
    // To make this fully real-time sync friendly, we often conform to the DB ID.
    // For now, let's return the data. 
    return NextResponse.json(todos)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    // We use the body provided. The frontend sends an object with an ID (uuid).
    // MongoDB generates its own _id.
    // Strategy: We can store the frontend 'id' as 'uuid' or just rely on MongoDB _id.
    // given the prompt "create .env and connect direct mongodb ... to real time create delete etc"
    // The simplest path to "best practices" is usually letting DB generate IDs.
    // But our frontend is offline-first (optimistic).
    
    // Let's create the todo. We'll ignore the client-side ID for the DB record itself to follow standard Mongo practice,
    // OR we can save it as a separate field if we want to correlate.
    // However, to keep it simple and working with the existing store:
    // We'll create the record.
    const todo = await Todo.create({
        id: body.id,
        title: body.title,
        description: body.description,
        createdAt: body.createdAt || Date.now()
    })
    
    return NextResponse.json(todo)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
    try {
        await connectDB()
        const body = await request.json()
        const { id, title, description } = body
        // Note: The frontend sends the 'id' which currently is a UUID. 
        // If we want to update by that UUID, we need to have stored it or we need to switch frontend to use _id.
        // For a seamless transition without rewriting the whole store logic:
        // We will assume for a moment the user might be okay with 'fire and forget' sync or we need to align IDs.
        
        // CRITICAL FIX: The current frontend generates UUIDs. MongoDB has _id.
        // If we only just started, the DB is empty.
        // Option A: modifying the model to accept a custom string _id (the uuid).
        // Option B: frontend uses the response _id to update itself.
        
        // Let's try to find by _id first (if we aligned them) or we need to trust the flow.
        // Given current Store implementation: `updateTodo` sends `id`.
        // If this ID is a UUID, `findById` will fail if it expects an ObjectId.
        
        // Let's update the Todo model to explicitly store the 'id' field as string if we want to match frontend UUIDs,
        // OR simpler: assume we are transitioning.
        
        // DECISION: To make the "real time create delete" work best with the existing "offline first" code:
        // We should probably rely on the DB ID. But since I can't easily change the frontend to wait for DB ID before showing (it's optimistic),
        // I will add an `id` field to the Mongoose schema in the next step to store the UUID.
        // This is the safest bridge.
        
        const todo = await Todo.findOneAndUpdate({ id: id }, { title, description }, { new: true })
        if (!todo) {
             return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
        }
        return NextResponse.json(todo)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB()
        const body = await request.json()
        const { id } = body
        
        // Uses the 'id' field (UUID)
        await Todo.findOneAndDelete({ id: id })
        
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
    }
}
