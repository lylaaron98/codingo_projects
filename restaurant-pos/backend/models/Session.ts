import mongoose, { Schema, Document } from 'mongoose';

export type SessionStatus = 'OPEN' | 'CLOSED';

export interface ISession extends Document {
  tableId: mongoose.Types.ObjectId;
  status: SessionStatus;
  openedAt: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Session ||
  mongoose.model<ISession>('Session', SessionSchema);
