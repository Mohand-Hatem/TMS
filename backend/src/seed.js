// File: src/seed.js
// What this does: Directly connects to MongoDB via Mongoose utilizing Env.js and domain constants, wipes existing database collections,
// and seeds demo data (Admin and Member accounts, Demo Project, and sample tasks) for testing and evaluation.
// Used by: Executed directly via terminal running `npm run seed` or `node src/seed.js`.

import './config/Env.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import AuditLog from './models/AuditLog.js';
import { ROLES } from './constants/roles.constant.js';
import { TASK_STATUS, TASK_PRIORITY } from './constants/task.constant.js';

async function seed() {
  await connectDB();

  console.log('Wiping existing database collections...');
  await Promise.all([
    User.deleteMany(),
    Project.deleteMany(),
    Task.deleteMany(),
    AuditLog.deleteMany()
  ]);

  console.log('Hashing passwords and creating Admin & Member users...');
  const adminHash = await bcrypt.hash('password123', 10);
  const memberHash = await bcrypt.hash('password123', 10);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    passwordHash: adminHash,
    role: ROLES.ADMIN
  });

  const member = await User.create({
    name: 'Member User',
    email: 'member@test.com',
    passwordHash: memberHash,
    role: ROLES.MEMBER
  });

  console.log('Creating Demo Project shared between Admin and Member...');
  const project = await Project.create({
    name: 'Demo Task Management Project',
    description: 'A fully seeded demo project ready for evaluation and API exploration.',
    owner: admin._id,
    members: [admin._id, member._id]
  });

  console.log('Seeding varied tasks for pagination, filtering, search, and sort testing...');
  await Task.insertMany([
    {
      title: 'Set up login and register pages',
      description: 'Implement authentication UI forms with httpOnly cookie handling.',
      status: TASK_STATUS.TO_DO,
      priority: TASK_PRIORITY.HIGH,
      project: project._id,
      creator: admin._id,
      assignee: member._id,
      dueDate: new Date(Date.now() + 86400000 * 3)
    },
    {
      title: 'Design database schemas and indexing',
      description: 'Verify relationships between projects and task assignments.',
      status: TASK_STATUS.IN_PROGRESS,
      priority: TASK_PRIORITY.MEDIUM,
      project: project._id,
      creator: admin._id,
      assignee: [admin._id, member._id], // Multi-assignee demonstration (up to 5 members)
      dueDate: new Date(Date.now() + 86400000 * 5)
    },
    {
      title: 'Write project README and Postman docs',
      description: 'Document architectural choices and export Postman testing collection.',
      status: TASK_STATUS.DONE,
      priority: TASK_PRIORITY.LOW,
      project: project._id,
      creator: admin._id,
      assignee: member._id,
      dueDate: new Date(Date.now() + 86400000 * 1)
    }
  ]);

  console.log('===========================================================');
  console.log('🌱 Database seeding completed successfully!');
  console.log('Seeded Test Credentials:');
  console.log('-----------------------------------------------------------');
  console.log('Admin Account  -> Email: admin@test.com  | Password: password123');
  console.log('Member Account -> Email: member@test.com | Password: password123');
  console.log('===========================================================');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
});
