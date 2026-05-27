const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Modifying TeamMember table...");
    
    // Add columns
    await prisma.$executeRawUnsafe(`ALTER TABLE TeamMember MODIFY userId VARCHAR(36) NULL;`);
    console.log("Made userId nullable");
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TeamMember ADD email VARCHAR(255) NULL;`);
      console.log("Added email column");
    } catch(e) { console.log("email column might already exist", e.message); }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TeamMember ADD name VARCHAR(255) NULL;`);
      console.log("Added name column");
    } catch(e) { console.log("name column might already exist", e.message); }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TeamMember ADD position VARCHAR(50) NULL;`);
      console.log("Added position column");
    } catch(e) { console.log("position column might already exist", e.message); }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TeamMember DROP INDEX TeamMember_teamId_userId_key;`);
      console.log("Dropped old unique constraint");
    } catch(e) { console.log("Old constraint might not exist", e.message); }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TeamMember ADD UNIQUE INDEX TeamMember_teamId_email_key(teamId, email);`);
      console.log("Added new unique constraint");
    } catch(e) { console.log("New constraint might already exist", e.message); }
    
    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
