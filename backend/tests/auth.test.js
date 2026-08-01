// File: tests/auth.test.js
// What this does: Executes automated Jest integration test suites covering the 5 critical verification criteria:
// password hashing, failed auth rejection, protected route gating, project access authorization, and automated AuditLog generation.
// Used by: Executed by Jest when running the terminal command `npm test`.

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Project from '../src/models/Project.js';
import Task from '../src/models/Task.js';
import AuditLog from '../src/models/AuditLog.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 600000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany(),
    Project.deleteMany(),
    Task.deleteMany(),
    AuditLog.deleteMany()
  ]);
});

test('1. Registering a user stores a hashed password, not plaintext', async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'test@example.com',
    password: 'myplaintextpassword'
  });
  expect(res.status).toBe(201);

  const user = await User.findOne({ email: 'test@example.com' });
  expect(user.passwordHash).toBeDefined();
  expect(user.passwordHash).not.toBe('myplaintextpassword');
  expect(user.passwordHash.length).toBeGreaterThan(20);
});

test('2. Logging in with the wrong password returns 401', async () => {
  await request(app).post('/api/auth/register').send({
    name: 'Login User',
    email: 'login@example.com',
    password: 'correctpassword'
  });

  const res = await request(app).post('/api/auth/login').send({
    email: 'login@example.com',
    password: 'wrongpassword'
  });

  expect(res.status).toBe(401);
  expect(res.body.success).toBe(false);
});

test('3. Hitting a protected route with no cookie returns 401', async () => {
  const res = await request(app).get('/api/projects');
  expect(res.status).toBe(401);
  expect(res.body.success).toBe(false);
});

test('4. A user who is not a project member cannot view/edit that project (403)', async () => {
  const ownerRes = await request(app).post('/api/auth/register').send({
    name: 'Project Owner',
    email: 'owner@example.com',
    password: 'password123'
  });
  const ownerCookie = ownerRes.headers['set-cookie'];

  const projRes = await request(app).post('/api/projects')
    .set('Cookie', ownerCookie)
    .send({ name: 'Private Project', description: 'Secret project' });
  expect(projRes.status).toBe(201);
  const projectId = projRes.body._id;

  const outsiderRes = await request(app).post('/api/auth/register').send({
    name: 'Outsider',
    email: 'outsider@example.com',
    password: 'password123'
  });
  const outsiderCookie = outsiderRes.headers['set-cookie'];

  const putRes = await request(app).put(`/api/projects/${projectId}`)
    .set('Cookie', outsiderCookie)
    .send({ name: 'Hacked Project Name' });
  expect(putRes.status).toBe(403);
  expect(putRes.body.success).toBe(false);

  const getTasksRes = await request(app).get(`/api/projects/${projectId}/tasks`)
    .set('Cookie', outsiderCookie);
  expect(getTasksRes.status).toBe(403);
  expect(getTasksRes.body.success).toBe(false);
});

test('5. Changing a task status creates a matching AuditLog entry', async () => {
  const userRes = await request(app).post('/api/auth/register').send({
    name: 'Task Modifier',
    email: 'modifier@example.com',
    password: 'password123'
  });
  const cookie = userRes.headers['set-cookie'];
  const userId = userRes.body.id;

  const projRes = await request(app).post('/api/projects')
    .set('Cookie', cookie)
    .send({ name: 'Task Demo Project' });
  const projectId = projRes.body._id;

  const taskRes = await request(app).post(`/api/projects/${projectId}/tasks`)
    .set('Cookie', cookie)
    .send({ title: 'Initial Task', status: 'To Do', priority: 'Medium' });
  expect(taskRes.status).toBe(201);
  const taskId = taskRes.body._id;

  const updateRes = await request(app).put(`/api/tasks/${taskId}`)
    .set('Cookie', cookie)
    .send({ status: 'In Progress' });
  expect(updateRes.status).toBe(200);
  expect(updateRes.body.status).toBe('In Progress');

  const auditLogs = await AuditLog.find({ task: taskId });
  expect(auditLogs.length).toBe(1);
  expect(auditLogs[0].fromStatus).toBe('To Do');
  expect(auditLogs[0].toStatus).toBe('In Progress');
  expect(auditLogs[0].changedBy.toString()).toBe(userId);
});
