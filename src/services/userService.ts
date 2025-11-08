import { 
  collection, 
  getDocs, 
  query, 
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

export const userService = {
  // Buscar todos os alunos
  async getAllAlunos(): Promise<User[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'aluno')
      );

      const querySnapshot = await getDocs(q);
      const alunos: User[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alunos.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt.toDate(),
          photoURL: data.photoURL
        });
      });

      // Ordenar por nome
      return alunos.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching alunos:', error);
      throw error;
    }
  }
};
