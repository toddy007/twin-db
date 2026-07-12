import { Schema } from 'mongoose';
import { DefaultSchemaType } from '../types/global.js';

export const DefaultSchema = new Schema<DefaultSchemaType>({
    _id: { type: String, required: true },
    data: { type: Object, default: {} },
});
