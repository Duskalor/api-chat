import { prisma } from 'prisma';

export const AllChats = async (userId: string) => {
  try {
    const userChats = await prisma.userChat.findMany({
      where: { userID: userId },
      include: {
        chat: {
          include: {
            messages: {
              take: 1,
              orderBy: { createAt: 'desc' },
            },
            user: {
              include: {
                user: true, // Incluir información de todos los usuarios en el chat
              },
            },
          },
        },
      },
    });

    return userChats.map((userChat) => {
      const chat = userChat.chat;

      // Para chats no grupales, obtener el otro participante
      const chatUsers = chat.user.map((u) => u.user);
      const otherUsers = chatUsers.filter((u) => u.id !== userId);

      return {
        id: chat.id,
        // Si no es grupo, usar nombre del otro usuario
        name: chat.isGroup
          ? chat.name || 'Grupo sin nombre'
          : otherUsers[0]?.name || 'Chat sin nombre',
        isGroup: chat.isGroup,
        // Si no es grupo, solo mostrar el otro usuario
        participants: otherUsers,
        lastMessage: chat.messages[0]
          ? {
              text: chat.messages[0].text,
              createdAt: chat.messages[0].createAt,
              senderId: chat.messages[0].userID,
            }
          : null,
      };
    });
  } catch (_error) {
    console.log('error');
    return [];
  }
};
