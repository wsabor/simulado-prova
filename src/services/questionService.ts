import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question, QuestionFormData, Alternativa } from '@/types';

export const questionService = {
  // Criar nova questão
  async createQuestion(data: QuestionFormData, professorId: string): Promise<string> {
    try {
      const alternativas: Alternativa[] = data.alternativas.map((texto, index) => ({
        texto,
        correta: index === data.alternativaCorreta
      }));

      const questionData = {
        enunciado: data.enunciado,
        alternativas,
        materia: data.materia,
        semestre: data.semestre,
        professorId,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'questions'), questionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  // Buscar uma questão por ID
  async getQuestionById(questionId: string): Promise<Question | null> {
    try {
      const docRef = doc(db, 'questions', questionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        enunciado: data.enunciado,
        alternativas: data.alternativas,
        materia: data.materia,
        semestre: data.semestre,
        professorId: data.professorId,
        createdAt: data.createdAt.toDate(),
        imagemUrl: data.imagemUrl
      };
    } catch (error) {
      console.error('Error fetching question:', error);
      throw error;
    }
  },

  // Buscar todas as questões de um professor
  async getQuestionsByProfessor(professorId: string): Promise<Question[]> {
    try {
      // Query simples sem orderBy para evitar necessidade de índice composto
      const q = query(
        collection(db, 'questions'),
        where('professorId', '==', professorId)
      );

      const querySnapshot = await getDocs(q);
      const questions: Question[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        questions.push({
          id: doc.id,
          enunciado: data.enunciado,
          alternativas: data.alternativas,
          materia: data.materia,
          semestre: data.semestre,
          professorId: data.professorId,
          createdAt: data.createdAt.toDate(),
          imagemUrl: data.imagemUrl
        });
      });

      // Ordenar no lado do cliente (JavaScript)
      return questions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  // Buscar questões por filtros
  async getQuestionsByFilters(
    professorId: string,
    materia?: string,
    semestre?: number
  ): Promise<Question[]> {
    try {
      // Query simples
      const q = query(
        collection(db, 'questions'),
        where('professorId', '==', professorId)
      );

      const querySnapshot = await getDocs(q);
      const questions: Question[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Filtrar no lado do cliente
        if (materia && data.materia !== materia) return;
        if (semestre && data.semestre !== semestre) return;
        
        questions.push({
          id: doc.id,
          enunciado: data.enunciado,
          alternativas: data.alternativas,
          materia: data.materia,
          semestre: data.semestre,
          professorId: data.professorId,
          createdAt: data.createdAt.toDate(),
          imagemUrl: data.imagemUrl
        });
      });

      // Ordenar no lado do cliente
      return questions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching filtered questions:', error);
      throw error;
    }
  },

  // Atualizar questão
  async updateQuestion(questionId: string, data: QuestionFormData): Promise<void> {
    try {
      const alternativas: Alternativa[] = data.alternativas.map((texto, index) => ({
        texto,
        correta: index === data.alternativaCorreta
      }));

      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        enunciado: data.enunciado,
        alternativas,
        materia: data.materia,
        semestre: data.semestre
      });
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Deletar questão
  async deleteQuestion(questionId: string): Promise<void> {
    try {
      const questionRef = doc(db, 'questions', questionId);
      await deleteDoc(questionRef);
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // Contar questões disponíveis por filtros
  async countQuestionsByFilters(
    professorId: string,
    materias: string[],
    semestres: number[]
  ): Promise<number> {
    try {
      // Query simples
      const q = query(
        collection(db, 'questions'),
        where('professorId', '==', professorId)
      );

      const querySnapshot = await getDocs(q);
      let count = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Contar apenas se matéria e semestre estão nos filtros
        if (materias.includes(data.materia) && semestres.includes(data.semestre)) {
          count++;
        }
      });

      return count;
    } catch (error) {
      console.error('Error counting questions:', error);
      return 0;
    }
  }
};
