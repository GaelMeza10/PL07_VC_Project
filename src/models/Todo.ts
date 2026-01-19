import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITodo extends Document {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

const TodoSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true }, // Store client-side UUID
  title: { type: String, required: true },
  description: { type: String, required: false },
  createdAt: { type: Number, default: () => Date.now() },
}, {
    // This helps frontend mapping manually or we can use toJSON transform if needed
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
});


const Todo: Model<ITodo> = mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);

export default Todo;
