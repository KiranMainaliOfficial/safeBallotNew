import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Election from '../models/Election.model.js';

const MONGO_URI = 'mongodb://localhost:27017/safeballotNew?replicaSet=rs0';

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        const users = await User.find().lean();
        console.log('\n--- USERS ---');
        users.forEach(u => {
            console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, isVerified: ${u.isVerified}`);
        });

        const elections = await Election.find().lean();
        console.log('\n--- ELECTIONS ---');
        elections.forEach(e => {
            console.log(`- Title: ${e.title}, Status: ${e.status}, ID: ${e._id}, Start: ${e.startTime}, End: ${e.endTime}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
