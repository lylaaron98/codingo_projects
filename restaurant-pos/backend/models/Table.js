import mongoose from 'mongoose';

const { Schema } = mongoose;

const TableSchema = new Schema(
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

export default mongoose.models.Table || mongoose.model('Table', TableSchema);
