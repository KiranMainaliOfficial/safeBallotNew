import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Election from '../models/Election.model.js';
import Candidate from '../models/Candidate.model.js';

async function run() {
    await connectDB();

    console.log('Clearing existing elections and candidates...');
    await Election.deleteMany({});
    await Candidate.deleteMany({});

    // Dates matching standard windows
    const now = new Date();
    const farFuture = new Date();
    farFuture.setDate(now.getDate() + 90);

    const nearFuture = new Date();
    nearFuture.setDate(now.getDate() + 2); // Closing Soon

    const electionsData = [
        {
            title: 'Presidential Election',
            description: 'Select one candidate for President of the United States. Safe Ballot delivers end-to-end encrypted online voting for the general public.',
            startTime: now,
            endTime: farFuture,
            status: 'active',
            settings: { allowRevote: false, requireOtp: true, maxVotesPerIp: 10 }
        },
        {
            title: 'Senate - District 7',
            description: 'Choose your senator representative for District 7. Keep your voice active in federal legislature decisions.',
            startTime: now,
            endTime: farFuture,
            status: 'active',
            settings: { allowRevote: false, requireOtp: true, maxVotesPerIp: 10 }
        },
        {
            title: 'Governor of California',
            description: 'State gubernatorial election for the state of California. Cast your ballot securely.',
            startTime: now,
            endTime: farFuture,
            status: 'active',
            settings: { allowRevote: false, requireOtp: true, maxVotesPerIp: 10 }
        },
        {
            title: 'Local School Board',
            description: 'Voters registration election for Local School Board representatives. Urgent decision affecting community schools.',
            startTime: now,
            endTime: nearFuture,
            status: 'active',
            settings: { allowRevote: false, requireOtp: true, maxVotesPerIp: 10 }
        },
        {
            title: 'Proposition 12 - Housing',
            description: 'State proposition on housing bonds funding and regulatory adjustments for residential constructions.',
            startTime: now,
            endTime: farFuture,
            status: 'active',
            settings: { allowRevote: false, requireOtp: true, maxVotesPerIp: 10 }
        },
        {
            title: 'City Mayor - Los Angeles',
            description: 'Municipal election for the city mayor of Los Angeles. Vote for candidate representing local policies and municipal updates.',
            startTime: now,
            endTime: farFuture,
            status: 'active',
            settings: { allowRevote: false, requireOtp: true, maxVotesPerIp: 10 }
        }
    ];

    const candidatesData = {
        'Presidential Election': [
            { name: 'Alexandra Rivera', party: 'National Democratic Party', bio: 'Experienced state governor and community advocate.', photoUrl: '' },
            { name: 'James T. Harrington', party: 'Conservative Alliance', bio: 'Senator with 15 years experience in business development.', photoUrl: '' },
            { name: 'Maria Chen', party: 'Green Citizens Party', bio: 'Environmental engineer advocating green energy transition.', photoUrl: '' }
        ],
        'Senate - District 7': [
            { name: 'Dr. Sarah Jenkins', party: 'Liberal Coalition', bio: 'Public policy expert and educator.', photoUrl: '' },
            { name: 'Robert Vance', party: 'Constitutional League', bio: 'Former representative for local district.', photoUrl: '' }
        ],
        'Governor of California': [
            { name: 'Gavin Newsom', party: 'Democratic Party', bio: 'Incumbent governor focusing on clean energy and housing.', photoUrl: '' },
            { name: 'Brian Dahle', party: 'Republican Party', bio: 'State senator advocating lower taxes and water reform.', photoUrl: '' }
        ],
        'Local School Board': [
            { name: 'Elena Rostova', party: 'Non-Partisan (Education First)', bio: 'Teacher and local mother.', photoUrl: '' },
            { name: 'Marcus Brody', party: 'Non-Partisan (Community Choice)', bio: 'School principal with focus on physical programs.', photoUrl: '' }
        ],
        'Proposition 12 - Housing': [
            { name: 'Yes on Prop 12', party: 'Approve housing bonds', bio: 'Support development of residential constructions.', photoUrl: '' },
            { name: 'No on Prop 12', party: 'Reject housing bonds', bio: 'Oppose bond funding for residential projects.', photoUrl: '' }
        ],
        'City Mayor - Los Angeles': [
            { name: 'Karen Bass', party: 'Democratic Alliance', bio: 'Mayor with emphasis on resolving homelessness.', photoUrl: '' },
            { name: 'Rick Caruso', party: 'Independent Alliance', bio: 'Businessman targeting local safety and business recovery.', photoUrl: '' }
        ]
    };

    for (const electInfo of electionsData) {
        const e = await Election.create(electInfo);
        console.log(`Created Election: ${e.title} (${e._id})`);

        const cands = candidatesData[e.title] || [];
        for (const cInfo of cands) {
            const cand = await Candidate.create({ ...cInfo, electionId: e._id });
            console.log(`  - Candidate: ${cand.name} (${cand.party})`);
        }
    }

    console.log('Seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
}

run().catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
});
