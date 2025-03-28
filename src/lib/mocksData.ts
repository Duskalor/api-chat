import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function generateMockData() {
  // Clear existing data to start fresh
  await prisma.messages.deleteMany();
  await prisma.userChat.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.user.deleteMany();

  // Generate Users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      return prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(), // In real app, use proper hashing!
        },
      });
    })
  );

  // Generate Chats (including some group chats)
  const chats = await Promise.all(
    Array.from({ length: 15 }).map(async () => {
      return prisma.chat.create({
        data: {
          name: faker.datatype.boolean() ? faker.company.name() : null,
          isGroup: faker.datatype.boolean(),
        },
      });
    })
  );

  // Create UserChat relationships
  for (const chat of chats) {
    // Randomly select 2-5 users for each chat
    const chatUsers = faker.helpers.arrayElements(users, { min: 2, max: 5 });

    await Promise.all(
      chatUsers.map((user) =>
        prisma.userChat.create({
          data: {
            userID: user.id,
            chatID: chat.id,
          },
        })
      )
    );
  }

  // Generate Messages
  for (const chat of chats) {
    // Get users in this chat
    const chatUsers = await prisma.userChat.findMany({
      where: { chatID: chat.id },
      select: { userID: true },
    });

    // Generate 20-50 messages per chat
    await Promise.all(
      Array.from({ length: faker.number.int({ min: 20, max: 50 }) }).map(
        async () => {
          const randomUser = faker.helpers.arrayElement(chatUsers);

          return prisma.messages.create({
            data: {
              text: faker.lorem.sentence(),
              userID: randomUser.userID,
              chatID: chat.id,
            },
          });
        }
      )
    );
  }

  console.log('Mock data generation complete!');
}
