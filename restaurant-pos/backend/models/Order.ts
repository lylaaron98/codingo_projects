import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'READY' | 'SERVED';

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  notes?: string;
}

export interface IOrder extends Document {
  sessionId: mongoose.Types.ObjectId;
  status: OrderStatus;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    nameSnapshot: {
      type: String,
      required: true,
    },
    priceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    notes: {
      type: String,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    status: {
      type: String,
      enum: ['NEW', 'IN_PROGRESS', 'READY', 'SERVED'],
      default: 'NEW',
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>('Order', OrderSchema);
