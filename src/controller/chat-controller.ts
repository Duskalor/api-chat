import { AllChats } from 'services/chat.service';

export const GetChats = async (id: string) => {
  try {
    const chats = await AllChats(id);
    return chats;
  } catch (_error) {
    console.log('error when trying to get data');
  }
};
