const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const sqlite = new Database('dev.db');
const adapter = new PrismaBetterSqlite3(sqlite);

try {
const prisma = new PrismaClient({ adapter });
console.log('success Prisma');
} catch(e) {
console.error("PRISMA INIT ERR:", e.message);
}
