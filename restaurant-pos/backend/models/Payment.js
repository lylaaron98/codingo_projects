import mongoose from 'mongoose';

const { Schema } = mongoose;

const PaymentSchema = new Schema(
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

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
