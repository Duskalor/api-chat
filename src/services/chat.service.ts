import { prisma } from 'prisma';

export const AllChats = async (userId: string) => {
  try {
    const userChats = await prisma.userChat.findMany({
      where: { userID: userId },
      include: {
        chat: {
          include: {
            messages: {
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

      // Obtener todos los usuarios en el chat
      const chatUsers = chat.user.map((u) => u.user);

      // Si es un grupo, incluir todos los usuarios, si no, solo el otro participante
      const participants = chat.isGroup
        ? chatUsers
        : chatUsers.filter((u) => u.id !== userId);

      return {
        id: chat.id,
        name: chat.isGroup
          ? chat.name
          : participants.length > 0
          ? participants[0]?.name
          : 'Desconocido',
        isGroup: chat.isGroup,
        participants, // Ahora contiene los participantes correctamente
        messages: chat.messages,
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
    console.log('Error:', _error);
    return [];
  }
};
