import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            enum: ['unread', 'read', 'replied'],
            default: 'unread'
        }
    },
    { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
