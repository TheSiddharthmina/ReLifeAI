import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  description: string;
  condition: string;
  returnReason: string;
  imageUrls: string[];
  s3Keys: string[];
  brand?: string;
  originalPrice?: number;
  weight?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['electronics', 'clothing', 'furniture', 'appliances', 'toys', 'books', 'sports', 'beauty', 'food', 'other'],
    },
    description: { type: String, default: '' },
    condition: {
      type: String,
      required: true,
      enum: ['new', 'like_new', 'good', 'fair', 'poor', 'damaged'],
    },
    returnReason: { type: String, required: true },
    imageUrls: { type: [String], default: [] },
    s3Keys: { type: [String], default: [] },
    brand: { type: String, trim: true },
    originalPrice: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
