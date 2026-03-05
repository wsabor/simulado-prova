import { connectDB } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { User } from '@/types';

export const userService = {
  async getAllAlunos(): Promise<User[]> {
    await connectDB();
    const docs = await UserModel.find({ role: 'aluno' }).sort({ name: 1 }).lean();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
      createdAt: doc.createdAt as Date,
    }));
  },
};
