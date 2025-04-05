import { faker } from '@faker-js/faker';
import { prisma } from 'prisma';

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
      const is = faker.datatype.boolean();
      return prisma.chat.create({
        data: {
          name: is ? faker.company.name() : null,
          isGroup: is,
        },
      });
    })
  );

  for (const chat of chats) {
    let chatUsers;

    if (chat.isGroup) {
      // Si es grupo, selecciona entre 3 y 5 usuarios
      chatUsers = faker.helpers.arrayElements(users, { min: 3, max: 5 });
    } else {
      // Si es un chat individual, selecciona **dos** usuarios
      const user1 = faker.helpers.arrayElement(users);
      let user2;

      do {
        user2 = faker.helpers.arrayElement(users);
      } while (user2.id === user1.id); // Asegurar que sean distintos

      chatUsers = [user1, user2];
    }

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
}
