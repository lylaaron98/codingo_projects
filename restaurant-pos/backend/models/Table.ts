import mongoose, { Schema, Document } from 'mongoose';

export type TableStatus = 'FREE' | 'OCCUPIED';

export interface ITable extends Document {
  tableNumber: number;
  status: TableStatus;
  currentSessionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['FREE', 'OCCUPIED'],
      default: 'FREE',
    },
    currentSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Table ||
  mongoose.model<ITable>('Table', TableSchema);
