import mongoose, { Schema, Document } from 'mongoose';

export type Role = 'WAITER' | 'KITCHEN' | 'CASHIER' | 'MANAGER';

export interface IUser extends Document {
  username: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
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
export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
