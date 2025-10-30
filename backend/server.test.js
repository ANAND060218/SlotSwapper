import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from './server'; // Assuming your server.js exports 'app'
import User from './models/User'; // Adjust paths if needed
import Event from './models/Event';
import SwapRequest from './models/SwapRequest';

let mongoServer;

// --- 1. Setup & Teardown ---
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all data before each test
  await User.deleteMany({});
  await Event.deleteMany({});
  await SwapRequest.deleteMany({});
});

// --- 2. The Core Logic Test ---
describe('Full Swap Logic Integration Test', () => {

  it('should allow two users to sign up, create slots, and successfully swap them', async () => {
    
    // --- Setup: Create Users ---
    const userA = { name: 'User A', email: 'a@test.com', password: 'password123' };
    const userB = { name: 'User B', email: 'b@test.com', password: 'password123' };
    
    await request(app).post('/api/auth/signup').send(userA);
    await request(app).post('/api/auth/signup').send(userB);

    // --- Login Users to get Tokens ---
    const loginARes = await request(app).post('/api/auth/login').send({ email: userA.email, password: userA.password });
    const loginBRes = await request(app).post('/api/auth/login').send({ email: userB.email, password: userB.password });

    const tokenA = loginARes.body.token;
    const tokenB = loginBRes.body.token;
    const userIdA = loginARes.body.user._id;
    const userIdB = loginBRes.body.user._id;

    // --- Create Events ---
    const slotAData = { title: 'Slot A', startTime: '2025-11-01T10:00:00Z', endTime: '2025-11-01T11:00:00Z' };
    const slotBData = { title: 'Slot B', startTime: '2025-11-02T14:00:00Z', endTime: '2025-11-02T15:00:00Z' };

    const eventARes = await request(app).post('/api/events').set('Authorization', `Bearer ${tokenA}`).send(slotAData);
    const eventBRes = await request(app).post('/api/events').set('Authorization', `Bearer ${tokenB}`).send(slotBData);

    const slotAId = eventARes.body._id;
    const slotBId = eventBRes.body._id;
    
    // --- Mark as Swappable ---
    await request(app).put(`/api/events/${slotAId}`).set('Authorization', `Bearer ${tokenA}`).send({ status: 'SWAPPABLE' });
    await request(app).put(`/api/events/${slotBId}`).set('Authorization', `Bearer ${tokenB}`).send({ status: 'SWAPPABLE' });

    // --- User A requests swap ---
    const swapReqBody = { mySlotId: slotAId, theirSlotId: slotBId };
    await request(app).post('/api/swap-request').set('Authorization', `Bearer ${tokenA}`).send(swapReqBody);

    // Verify slots are pending
    const swapReq = await SwapRequest.findOne({ requesterSlotId: slotAId });
    expect(swapReq.status).toBe('PENDING');

    // --- User B accepts swap ---
    await request(app).post(`/api/swap-response/${swapReq._id}`).set('Authorization', `Bearer ${tokenB}`).send({ accept: true });

    // --- Verification ---
    const finalSlotA = await Event.findById(slotAId);
    const finalSlotB = await Event.findById(slotBId);

    // 1. Check if owners were swapped
    expect(finalSlotA.userId.toString()).toBe(userIdB);
    expect(finalSlotB.userId.toString()).toBe(userIdA);

    // 2. Check if slots are set back to BUSY
    expect(finalSlotA.status).toBe('BUSY');
    expect(finalSlotB.status).toBe('BUSY');

    // 3. Check if request is marked ACCEPTED
    const finalSwapReq = await SwapRequest.findById(swapReq._id);
    expect(finalSwapReq.status).toBe('ACCEPTED');
  });
});