import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['WAITER', 'KITCHEN', 'CASHIER', 'MANAGER'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in serverless
export default mongoose.models.User || mongoose.model('User', UserSchema);
