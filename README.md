# Vellozes Hack V2.0

Aplicação full-stack para estudantes: login/cadastro, tarefas sincronizadas por usuário, assistente de IA server-side, atalhos para plataformas oficiais e uma área administrativa protegida por função.

## Recursos reais

- Cadastro e login com Supabase Auth.
- Tarefas guardadas no banco Supabase e protegidas por Row Level Security (RLS).
- Assistente de IA via função serverless, com a chave OpenAI somente no servidor.
- Atalhos externos para Sala do Futuro, Tarefa SP, Redação Paulista, Leia SP, Alura e Matific.
- Área administrativa que só aparece para perfis com `role=admin`.

## Limites importantes

O Vellozes Hack é um projeto independente, não afiliado ao Zunder ou à Secretaria da Educação. Não captura RA/senhas escolares, não faz login em plataformas de terceiros, não lê suas páginas, não envia respostas, não marca atividades como concluídas em sistemas escolares e não altera notas. As integrações são links para os serviços oficiais. A IA é um tutor: explica e ajuda a revisar, mas o estudante confere e envia o próprio trabalho.

## Requisitos

- Node.js 20+
- Conta Supabase
- Conta Vercel
- Chave da API OpenAI para ativar o assistente

## 1. Configurar o Supabase

1. Crie um projeto em https://supabase.com/.
2. Abra **SQL Editor** e execute todo o arquivo `supabase/schema.sql`.
3. Em **Project Settings → API**, copie Project URL e a chave `anon`/publishable.
4. Em **Authentication → URL Configuration**, adicione a URL local `http://localhost:5173` e, depois de publicar, a URL pública do site.
5. Não desative a confirmação de e-mail em produção sem entender as implicações.

## 2. Configurar o projeto local

1. Instale Node.js 20+ em https://nodejs.org/.
2. Extraia o ZIP e abra a pasta no VS Code.
3. Copie `.env.example` para `.env`.
4. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Para a função IA local, use Vercel CLI e configure também `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` e `OPENAI_MODEL` no ambiente local. **Nunca use service role nem chave OpenAI em variáveis `VITE_`.**
6. No terminal:
   ```bash
   npm install
   npx vercel dev
   ```
7. Abra a URL local indicada pelo Vercel CLI.

## 3. Publicar na Vercel

1. Crie um repositório privado no GitHub e envie os arquivos do projeto.
2. Importe o repositório em https://vercel.com/.
3. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (opcional; padrão `gpt-6-astra`)
4. Faça Deploy.
5. Copie a URL criada e adicione-a em Supabase → Authentication → URL Configuration → Redirect URLs.
6. Teste cadastro, confirmação de e-mail, login, criação de tarefa e assistente.

## 4. Dar acesso de administrador

A área administrativa fica escondida para estudantes. Para conceder acesso, abra SQL Editor no Supabase e execute o comando comentado no final de `supabase/schema.sql`, substituindo pelo e-mail correto. Faça isso somente para uma conta sua e confiável. Não existe botão público para promover usuários.

## 5. Estrutura

- `index.html` — ponto de entrada
- `src.js` — interface, autenticação e operações do banco
- `style.css` — visual responsivo escuro/azul
- `api/assistant.js` — endpoint server-side da IA
- `supabase/schema.sql` — tabelas, trigger e políticas RLS
- `.env.example` — nomes das variáveis necessárias
- `vercel.json` — configuração de função serverless

## Privacidade

Não use dados de menores sem autorização adequada. Não solicite nem armazene credenciais escolares. O banco armazena e-mail da conta criada no Supabase e tarefas que o usuário cadastrar. Defina política de privacidade e obtenha consentimento aplicável antes de disponibilizar publicamente.
