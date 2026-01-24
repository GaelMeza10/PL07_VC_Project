import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IList extends Document {
  id: string
  name: string
  userId: string
  createdAt: Date
}

const ListSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
})

const List: Model<IList> = mongoose.models.List || mongoose.model<IList>('List', ListSchema)

export default List
