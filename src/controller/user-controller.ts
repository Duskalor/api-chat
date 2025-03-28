import type { User } from '@prisma/client';
import { prisma } from 'prisma';

export const getUserController = async (): Promise<User[]> => {
  return await prisma.user.findMany();
};
