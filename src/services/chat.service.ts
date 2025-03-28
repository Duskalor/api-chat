import { prisma } from 'prisma';

export const AllChats = async (userID: string) => {
  try {
    const chats = await prisma.userChat.findMany({
      where: {
        userID,
      },
      include: {},
    });
    return chats;
  } catch (_error) {
    console.log('error');
    return [];
  }
};
