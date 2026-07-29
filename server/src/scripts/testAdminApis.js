import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function test() {
    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@safeballot.app',
            password: 'Admin@1234',
        });
        const { accessToken } = loginRes.data.data;
        console.log('Login successful! Token acquired.');

        const headers = { Authorization: `Bearer ${accessToken}` };

        console.log('\n2. Creating an election...');
        const createRes = await axios.post(`${BASE_URL}/elections`, {
            title: 'Test API Election',
            description: 'This is a test election',
            startTime: new Date(Date.now() + 10000).toISOString(),
            endTime: new Date(Date.now() + 86400000).toISOString(),
        }, { headers });
        const election = createRes.data.data;
        console.log('Election created successfully:', election);

        console.log('\n3. Adding a candidate...');
        const candRes = await axios.post(`${BASE_URL}/elections/${election._id}/candidates`, {
            name: 'Candidate A',
            party: 'Alpha Party',
        }, { headers });
        console.log('Candidate added successfully:', candRes.data.data);

        console.log('\n4. Activating election status...');
        const statusRes = await axios.patch(`${BASE_URL}/elections/${election._id}/status`, {
            status: 'active',
        }, { headers });
        console.log('Status updated successfully:', statusRes.data.data);

    } catch (err) {
        console.error('API Error details:', err);
    }
}

test();
