const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const p = await prisma.project.create({
      data: {
        name: 'test-2',
        procedures: {
          create: {
            name: 'testProc',
            jsonPayload: '[]'
          }
        }
      }
    });
    console.log('success:', p);
  } catch(e) {
    console.error('error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
