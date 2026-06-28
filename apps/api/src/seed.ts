import bcrypt from 'bcrypt'; import { prisma } from './common/prisma.js';
const username=process.env.ADMIN_USERNAME ?? 'admin'; const password=process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
await prisma.user.upsert({where:{username},update:{},create:{username,displayName:'Wedding Admin',role:'ADMIN',passwordHash:await bcrypt.hash(password,12)}}); console.log(`Admin ready: ${username}`); await prisma.$disconnect();
