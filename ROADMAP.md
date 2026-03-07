# Roadmap - Simulado Prova

## Concluido

- [x] **Dashboard do professor dinamico** - Cards com valores reais (Total de Questoes, Provas Ativas, Alunos Cadastrados, Taxa de Conclusao)
- [x] **Feedback por questao (acerto/erro)** - Campos "feedbackAcerto" e "feedbackErro" em cada questao, exibidos na revisao e na correcao coletiva
- [x] **Revisao de prova pelo aluno** - Apos finalizar, revisar a prova vendo acertos/erros com gabarito e feedback
- [x] **Tela de correcao da prova pelo professor** - Questoes de uma prova com gabarito e feedbacks para correcao coletiva em sala
- [x] **Reset de senha pelo professor** - Resetar senha de aluno pela interface
- [x] **Cadastro de alunos em lote (CSV)** - Importar lista com nome, email, turma e gerar senha padrao
- [x] **Exportar resultados para CSV** - Exportar tabela de resultados com BOM UTF-8 para Excel
- [x] **Pagina de creditos** - Informacoes do desenvolvedor, versao, stack e agradecimentos
- [x] **Categorias/tags nas questoes** - Tags livres para categorizar questoes, com filtro na listagem e suporte na importacao JSON
- [x] **Modo escuro** - Tema dark completo com ThemeToggle (claro/escuro/sistema)

## Prioridade Alta

- [ ] **Manual do professor** - Guia de uso do sistema com prints e instrucoes passo a passo (cadastrar questoes, montar provas, importar JSON, atribuir alunos, consultar resultados)
- [ ] **Edicao de prova** - Permitir editar titulo, tempo e alunos atribuidos de uma prova existente
- [ ] **Responsividade mobile** - Adaptar interface de prova para celular (drawer/bottom sheet no lugar da sidebar)

## Prioridade Media

- [ ] **Duplicar prova** - Botao para copiar configuracoes de uma prova existente
- [ ] **Feedback ao aluno inativo no login** - Mensagem especifica "Sua conta esta desativada" em vez de erro generico
- [ ] **Multiplas tentativas configuraveis** - Professor configura numero de tentativas por prova (melhor nota ou ultima)
- [ ] **Notificacoes** - Avisar o aluno quando uma nova prova e atribuida

## Prioridade Baixa

- [ ] **Questoes discursivas** - Suporte a questoes abertas com correcao manual pelo professor
- [ ] **Banco de questoes compartilhado** - Professores do mesmo curso compartilharem questoes entre si
- [ ] **Relatorio individual do aluno** - PDF com historico completo, notas e evolucao ao longo do tempo
- [ ] **Upload de imagens no servidor** - Upload direto de imagens para questoes (volume Docker ou S3)
