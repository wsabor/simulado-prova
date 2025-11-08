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
import { Prova, ProvaFormData } from '@/types';

export const provaService = {
  // Criar nova prova
  async createProva(data: ProvaFormData, professorId: string): Promise<string> {
    try {
      const provaData = {
        titulo: data.titulo,
        materias: data.materias,
        semestres: data.semestres,
        numQuestoes: data.numQuestoes,
        tempoLimite: data.tempoLimite,
        professorId,
        ativa: true,
        alunosAtribuidos: data.alunosAtribuidos || [],
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'provas'), provaData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating prova:', error);
      throw error;
    }
  },

  // Buscar uma prova por ID
  async getProvaById(provaId: string): Promise<Prova | null> {
    try {
      const docRef = doc(db, 'provas', provaId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        titulo: data.titulo,
        materias: data.materias,
        semestres: data.semestres,
        numQuestoes: data.numQuestoes,
        tempoLimite: data.tempoLimite,
        professorId: data.professorId,
        ativa: data.ativa,
        createdAt: data.createdAt.toDate(),
        alunosAtribuidos: data.alunosAtribuidos || []
      };
    } catch (error) {
      console.error('Error fetching prova:', error);
      throw error;
    }
  },

  // Buscar todas as provas de um professor
  async getProvasByProfessor(professorId: string): Promise<Prova[]> {
    try {
      const q = query(
        collection(db, 'provas'),
        where('professorId', '==', professorId)
      );

      const querySnapshot = await getDocs(q);
      const provas: Prova[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        provas.push({
          id: doc.id,
          titulo: data.titulo,
          materias: data.materias,
          semestres: data.semestres,
          numQuestoes: data.numQuestoes,
          tempoLimite: data.tempoLimite,
          professorId: data.professorId,
          ativa: data.ativa,
          createdAt: data.createdAt.toDate(),
          alunosAtribuidos: data.alunosAtribuidos || []
        });
      });

      // Ordenar no lado do cliente
      return provas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching provas:', error);
      throw error;
    }
  },

  // Buscar provas disponíveis para um aluno
  async getProvasForAluno(alunoId: string): Promise<Prova[]> {
    try {
      const q = query(
        collection(db, 'provas'),
        where('ativa', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const provas: Prova[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Verificar se o aluno está na lista de alunos atribuídos
        if (data.alunosAtribuidos && data.alunosAtribuidos.includes(alunoId)) {
          provas.push({
            id: doc.id,
            titulo: data.titulo,
            materias: data.materias,
            semestres: data.semestres,
            numQuestoes: data.numQuestoes,
            tempoLimite: data.tempoLimite,
            professorId: data.professorId,
            ativa: data.ativa,
            createdAt: data.createdAt.toDate(),
            alunosAtribuidos: data.alunosAtribuidos || []
          });
        }
      });

      return provas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching provas for aluno:', error);
      throw error;
    }
  },

  // Atualizar prova
  async updateProva(provaId: string, data: ProvaFormData): Promise<void> {
    try {
      const provaRef = doc(db, 'provas', provaId);
      await updateDoc(provaRef, {
        titulo: data.titulo,
        materias: data.materias,
        semestres: data.semestres,
        numQuestoes: data.numQuestoes,
        tempoLimite: data.tempoLimite,
        alunosAtribuidos: data.alunosAtribuidos || []
      });
    } catch (error) {
      console.error('Error updating prova:', error);
      throw error;
    }
  },

  // Ativar/Desativar prova
  async toggleProvaAtiva(provaId: string, ativa: boolean): Promise<void> {
    try {
      const provaRef = doc(db, 'provas', provaId);
      await updateDoc(provaRef, { ativa });
    } catch (error) {
      console.error('Error toggling prova:', error);
      throw error;
    }
  },

  // Deletar prova
  async deleteProva(provaId: string): Promise<void> {
    try {
      const provaRef = doc(db, 'provas', provaId);
      await deleteDoc(provaRef);
    } catch (error) {
      console.error('Error deleting prova:', error);
      throw error;
    }
  }
};
