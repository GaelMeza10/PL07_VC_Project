import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import List from '@/models/List'
import Todo from '@/models/Todo'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return await verifyToken(token)
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const lists = await List.find({ userId: user.userId as string }).sort({ createdAt: 1 })
  return NextResponse.json(lists)
}

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, name } = body

  if (!id || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await connectDB()
  const newList = await List.create({
    id,
    name,
    userId: user.userId as string
  })

  return NextResponse.json(newList)
}

export async function PUT(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, name } = body

  await connectDB()
  const list = await List.findOneAndUpdate(
    { id, userId: user.userId as string },
    { name },
    { new: true }
  )
  
  if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 })
  return NextResponse.json(list)
}

export async function DELETE(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id } = body

  await connectDB()
  const list = await List.findOne({ id, userId: user.userId as string })
  if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 })

  // Cascading delete: remove all todos in this list
  await Todo.deleteMany({ listId: id })
  await List.deleteOne({ id })

  return NextResponse.json({ success: true })
}
