# FastTodo - Offline-First Task Manager

A production-ready, offline-first todo application with authentication, multi-list organization, and rich task metadata. Built with Next.js 15, TypeScript, and MongoDB.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 🔐 Authentication & Security
- **Secure Authentication**: Email/Password signup and login with JWT
- **HTTP-only Cookies**: Session management with secure, HTTP-only cookies
- **Route Protection**: Automatic redirect to login for protected routes
- **Data Isolation**: Complete user data privacy and separation
- **Robust Logout**: Clean session termination with client-side cleanup

### 📋 Multi-List Organization
- **Unlimited Lists**: Create and manage multiple todo lists
- **List Management**: Rename and delete lists with ease
- **Cascading Delete**: Deleting a list removes all associated todos
- **Smart Defaults**: Auto-select first list on load
- **List Switching**: Quick dropdown navigation between lists

### ✅ Rich Todo Metadata
Each todo includes:
- **Title** and **Description**
- **Status**: Pending | Todo | In Progress | Completed
- **Category**: Bug | Feature | Docs | Improvement | Refactor
- **Priority**: Minor | Normal | Important | Critical
- **Visual Badges**: Color-coded badges for quick identification

### 🚀 Offline-First Architecture
- **Instant Updates**: Optimistic UI for immediate feedback
- **LocalStorage Caching**: Persistent offline data storage
- **Smart Sync**: Automatic synchronization when online
- **No Loading Flash**: Skeleton loaders during hydration
- **Conflict Resolution**: Intelligent merge strategy for sync conflicts

### 🎨 Premium User Experience
- **Dark Mode**: System, light, and dark theme support
- **Smooth Transitions**: No jarring UI changes
- **Modern Design**: Clean interface with shadcn/ui components
- **Responsive Layout**: Works on all screen sizes
- **Accessible**: ARIA labels and keyboard navigation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **State Management**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with jose, HTTP-only cookies
- **Theme**: next-themes for dark mode support

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or cloud like MongoDB Atlas)
- Git

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/fasttodo.git
cd fasttodo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/fasttodo
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fasttodo

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### First Time Setup

1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Click "Sign Up" and create an account
4. After signup, you'll be automatically logged in

### Creating Your First List

1. Click the **"Create List"** button
2. Enter a list name (e.g., "Work Tasks")
3. Click **"Done"**

### Adding Todos

1. Make sure a list is selected (shown in the dropdown)
2. Click **"Create Todo"**
3. Fill in the details:
   - **Title** (required)
   - **Description** (optional)
   - **Status** (default: Todo)
   - **Category** (default: Feature)
   - **Priority** (default: Normal)
4. Click **"Save changes"**

### Managing Lists

- **Switch Lists**: Click the list dropdown, select a different list
- **Rename List**: Click the ⋮ menu next to the list dropdown → "Rename list"
- **Delete List**: Click the ⋮ menu → "Delete list" (deletes all todos in the list)

### Offline Usage

The app works perfectly offline:

1. **Go Offline**: Disconnect from the internet
2. **Create/Edit**: Make changes to todos and lists
3. **Local Storage**: Changes are saved immediately to localStorage
4. **Reload**: Page reloads show cached data with no flash
5. **Reconnect**: Automatic sync to server when back online

### Theme Switching

Click the **Sun/Moon icon** in the header to toggle between:
- Light mode
- Dark mode
- System preference

## 🏗️ Architecture

### Data Flow

```
User Action
    ↓
Zustand Store (Optimistic Update)
    ↓
LocalStorage (Offline Persistence)
    ↓
API Route (if online)
    ↓
MongoDB (Server Persistence)
    ↓
Sync & Merge (on reconnect)
```

### Project Structure

```
fasttodo/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...path]/    # Auth endpoints
│   │   │   ├── lists/             # List CRUD
│   │   │   └── todos/             # Todo CRUD
│   │   ├── login/                 # Login page
│   │   ├── signup/                # Signup page
│   │   ├── layout.tsx             # Root layout with ThemeProvider
│   │   └── page.tsx               # Main dashboard
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── header.tsx             # App header with theme toggle
│   │   ├── todo-list.tsx          # Main todo list view
│   │   ├── todo-card.tsx          # Individual todo card
│   │   ├── todo-dialog.tsx        # Create/edit dialog
│   │   ├── create-list-dialog.tsx # List creation
│   │   └── ...
│   ├── lib/
│   │   ├── db.ts                  # MongoDB connection
│   │   └── auth.ts                # JWT utilities
│   ├── models/
│   │   ├── Todo.ts                # Todo Mongoose schema
│   │   ├── List.ts                # List Mongoose schema
│   │   └── User.ts                # User Mongoose schema
│   ├── store/
│   │   └── use-todo-store.ts      # Zustand store with sync logic
│   └── proxy.ts                   # Route protection middleware
└── package.json
```

### Key Features Implementation

#### Offline-First Sync

The app uses a sophisticated sync engine in `use-todo-store.ts`:

1. **Push Deletions**: Sync deleted items to server
2. **Push Updates**: Sync created/modified items
3. **Pull & Merge**: Fetch server data and merge with local changes
4. **Conflict Resolution**: Unsynced local changes always take precedence

#### Authentication Flow

- Login → JWT signed → HTTP-only cookie set
- Every API request → Cookie validated → User identified
- Protected routes → `proxy.ts` checks auth → Redirect if needed

## 🧪 Testing

### Manual Testing Checklist

- [ ] Signup and login
- [ ] Create multiple lists
- [ ] Switch between lists
- [ ] Create todos with different statuses/categories/priorities
- [ ] Edit todos
- [ ] Delete todos
- [ ] Rename list
- [ ] Delete list (verify cascading delete)
- [ ] Go offline, create todo, reconnect (verify sync)
- [ ] Reload page offline (verify no data loss)
- [ ] Toggle theme (light/dark/system)
- [ ] Logout and login again

## 🐛 Troubleshooting

### MongoDB Connection Issues

If you get connection errors:
1. Ensure MongoDB is running: `mongod --version`
2. Check your `MONGODB_URI` in `.env.local`
3. For MongoDB Atlas, ensure IP whitelist includes your IP

### JWT Errors

If you see JWT-related errors:
1. Verify `JWT_SECRET` is set in `.env.local`
2. Clear cookies and try logging in again
3. Regenerate JWT_SECRET with a strong random string

### Hydration Errors

If you see hydration warnings:
1. Check that `suppressHydrationWarning` is on `<html>` tag
2. Ensure ThemeProvider is wrapping the app
3. Clear browser cache and reload

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Zustand](https://zustand-demo.pmnd.rs/) - Lightweight state management
- [MongoDB](https://www.mongodb.com/) - Database platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

**Built with ❤️ using Next.js and TypeScript**