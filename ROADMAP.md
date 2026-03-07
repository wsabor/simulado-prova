# Roadmap - Simulado Prova

## Prioridade Alta

- [x] **Cadastro de alunos em lote (CSV/planilha)** - Importar lista de chamada com nome, email, turma e gerar senha padrao
- [x] **Exportar resultados para Excel/PDF** - Exportar tabela de resultados como CSV/Excel ou PDF com boletim da turma
- [x] **Dashboard do professor dinamico** - Cards com valores reais (Total de Questoes, Provas Ativas, Alunos Cadastrados, Taxa de Conclusao)
- [x] **Feedback por questao (acerto/erro)** - Adicionar campos "feedbackAcerto" e "feedbackErro" em cada questao, exibidos na revisao da prova pelo aluno e na correcao coletiva pelo professor em sala de aula
- [x] **Revisao de prova pelo aluno** - Apos finalizar, poder revisar a prova vendo acertos/erros com gabarito e feedback (sem alterar)
- [x] **Tela de correcao da prova pelo professor** - Exibir questoes de uma prova com gabarito e feedbacks para correcao e revisao coletiva com os alunos em sala
- [x] **Reset de senha pelo professor** - Resetar senha de aluno pela interface (sem precisar acessar MongoDB)
- [ ] **Manual do professor** - Guia de uso do sistema com prints e instrucoes passo a passo (cadastrar questoes, montar provas, importar JSON, atribuir alunos, consultar resultados)
- [x] **Pagina de creditos** - Pagina com informacoes do desenvolvedor, versao do sistema, stack utilizada e agradecimentos

## Prioridade Media

- [ ] **Edicao de prova** - Permitir editar titulo, tempo e alunos atribuidos de uma prova existente
- [ ] **Duplicar prova** - Botao para copiar configuracoes de uma prova existente
- [ ] **Categorias/tags nas questoes** - Tags de dificuldade (facil, media, dificil) para montar provas com distribuicao
- [ ] **Responsividade mobile** - Adaptar interface de prova para celular (drawer/bottom sheet no lugar da sidebar)
- [ ] **Feedback ao aluno inativo no login** - Mensagem especifica "Sua conta esta desativada" em vez de erro generico

## Prioridade Baixa

- [ ] **Multiplas tentativas configuraveis** - Professor configura numero de tentativas por prova (melhor nota ou ultima)
- [ ] **Questoes discursivas** - Suporte a questoes abertas com correcao manual pelo professor
- [ ] **Banco de questoes compartilhado** - Professores do mesmo curso compartilharem questoes entre si
- [ ] **Notificacoes** - Avisar o aluno quando uma nova prova e atribuida
- [ ] **Relatorio individual do aluno** - PDF com historico completo, notas e evolucao ao longo do tempo
- [ ] **Upload de imagens no servidor** - Upload direto de imagens para questoes (volume Docker ou S3)
- [x] **Modo escuro** - Implementar tema dark completo (ThemeToggle ja existe no header)
