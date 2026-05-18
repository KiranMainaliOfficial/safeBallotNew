import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.model.js';

async function run() {
    await connectDB();
    const email = 'admin@safeballot.app';
    const exists = await User.findOne({ email });
    if (exists) {
        console.log('Admin already exists:', email);
    } else {
        await User.create({
            name: 'Admin',
            email,
            passwordHash: await bcrypt.hash('Admin@1234', 12),
            role: 'admin',
            isVerified: true,
        });
        console.log('Created admin:', email, 'password: Admin@1234');
    }
    await mongoose.disconnect();
    process.exit(0);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});