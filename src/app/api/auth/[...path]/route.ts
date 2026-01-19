import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { hashPassword, signToken, verifyPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  // Await params before using them as per Next.js 15/16 best practices
  const { path } = await params;
  const action = path[0];

  await connectDB();
  // const body = await request.json(); // REMOVED: Parse separately per action

  if (action === 'signup') {
    const body = await request.json();
    const { name, email, password } = body;
    
    if (!name || !email || !password) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({ name, email, password: hashedPassword });

    // Login immediately
    const token = await signToken({ userId: user._id.toString(), email: user.email, name: user.name });
    
    // Set Cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
    });

    return NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  }

  if (action === 'login') {
    const body = await request.json();
    const { email, password } = body;
    const user = await User.findOne({ email });

    if (!user || !user.password || !(await verifyPassword(password, user.password))) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signToken({ userId: user._id.toString(), email: user.email, name: user.name });
    
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
    });

    return NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  }

  if (action === 'logout') {
    const cookieStore = await cookies();
    // Explicitly match the path used when setting the cookie
    // Explicitly expire the cookie with matching attributes
    cookieStore.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/' 
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 404 });
}
