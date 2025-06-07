# Sistema de Análise Gráfica

Sistema web para análise gráfica com autenticação de usuários, upload e visualização de gráficos.

## Tecnologias Utilizadas

### Backend
- Node.js com Express
- TypeScript
- PostgreSQL com TypeORM
- JWT para autenticação
- Bcrypt para criptografia
- Class Validator para validação

### Frontend
- React com TypeScript
- Material-UI para interface
- React Router para navegação
- Chart.js para visualização de gráficos
- Axios para requisições HTTP

## Configuração do Ambiente

### Pré-requisitos
- Node.js (v14 ou superior)
- PostgreSQL (v12 ou superior)
- npm ou yarn

### Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo .env com as seguintes variáveis:
```
PORT=5000
JWT_SECRET=sua_chave_secreta_aqui

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=vision_db
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

### Frontend

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## Funcionalidades

### Usuários
- Registro de novos usuários
- Login com autenticação JWT
- Perfil de usuário com diferentes níveis de acesso

### Gráficos
- Upload de dados para criação de gráficos
- Visualização interativa de gráficos
- Organização em dashboard
- Histórico de análises

## Segurança
- Autenticação JWT
- Senhas criptografadas com bcrypt
- Validação de dados
- Proteção contra CSRF e XSS
- Rate limiting

## Estrutura do Projeto

```
/backend
  /src
    /config      # Configurações
    /controllers # Controladores
    /models      # Modelos
    /routes      # Rotas
    /middleware  # Middlewares
    app.ts       # Arquivo principal

/frontend
  /src
    /components  # Componentes React
    /pages       # Páginas
    /services    # Serviços
    /hooks       # Hooks personalizados
    /utils       # Utilitários
    App.tsx      # Componente principal
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. 