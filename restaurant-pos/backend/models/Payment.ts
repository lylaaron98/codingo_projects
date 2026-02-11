import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMethod = 'CASH' | 'CARD';

export interface IPayment extends Document {
  sessionId: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      unique: true, // One payment per session
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ['CASH', 'CARD'],
      required: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>('Payment', PaymentSchema);
