import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITodo extends Document {
  id: string;
  userId: string;
  listId: string;
  title: string;
  description: string;
  status: 'Pending' | 'Todo' | 'In Progress' | 'Completed';
  category: 'Bug' | 'Feature' | 'Docs' | 'Improvement' | 'Refactor';
  priority: 'Minor' | 'Normal' | 'Important' | 'Critical';
  createdAt: number;
}

const TodoSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true }, 
  userId: { type: String, required: true, index: true },
  listId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  status: { type: String, enum: ['Pending', 'Todo', 'In Progress', 'Completed'], default: 'Todo' },
  category: { type: String, enum: ['Bug', 'Feature', 'Docs', 'Improvement', 'Refactor'], default: 'Feature' },
  priority: { type: String, enum: ['Minor', 'Normal', 'Important', 'Critical'], default: 'Normal' },
  createdAt: { type: Number, default: () => Date.now() },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
});


const Todo: Model<ITodo> = mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);

export default Todo;
