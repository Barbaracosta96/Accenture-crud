# Sistema de Gerenciamento de Empresas e Fornecedores

Sistema full-stack para gerenciamento de empresas e fornecedores, desenvolvido com Spring Boot e Angular. O sistema permite o cadastro e gerenciamento de empresas e seus fornecedores, com suporte a diferentes tipos de fornecedores (pessoa física e jurídica) e validações específicas.

## Tecnologias Utilizadas

### Backend
- Java 17
- Spring Boot 3.x
- Spring Data JPA
- Spring Validation
- PostgreSQL
- JUnit 5 para testes unitários
- Docker

### Frontend
- Angular 16+
- Angular Material
- TypeScript
- RxJS
- Angular Forms
- Docker

## Funcionalidades

- CRUD completo de Empresas e Fornecedores
- Relacionamento muitos-para-muitos entre Empresas e Fornecedores
- Validação de CEP utilizando a API cep.la
- Validações específicas:
  - CNPJ/CPF único
  - Validação de idade para fornecedores pessoa física do Paraná
- Filtros de pesquisa por Nome e CPF/CNPJ
- Interface responsiva e moderna

## Como Executar

### Requisitos
- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento)
- Java 17 (para desenvolvimento)

### Usando Docker
1. Clone o repositório
2. Na raiz do projeto, execute:
```bash
docker-compose up --build
```
3. Aguarde todos os containers iniciarem
4. Acesse a aplicação em: http://localhost:4200

### Desenvolvimento Local

#### Backend
1. Configure o PostgreSQL localmente ou use o container Docker:
```bash
docker-compose up postgres
```

2. Na pasta crud-spring:
```bash
./mvnw spring-boot:run
```
O backend estará disponível em http://localhost:8080

#### Frontend
1. Na pasta crud-angular:
```bash
npm install
npm start
```
O frontend estará disponível em http://localhost:4200

## Estrutura do Projeto

### Backend (crud-spring)
- `src/main/java/com/barbara/`
  - `model/` - Entidades JPA
  - `repository/` - Repositórios Spring Data
  - `service/` - Lógica de negócio
  - `controller/` - REST Controllers

### Frontend (crud-angular)
- `src/app/`
  - `features/` - Módulos principais
    - `companies/` - Gestão de empresas
    - `suppliers/` - Gestão de fornecedores
  - `shared/` - Componentes e serviços compartilhados

## API Endpoints

### Empresas
- `GET /api/companies` - Lista todas as empresas
- `GET /api/companies/{id}` - Obtém uma empresa específica
- `POST /api/companies` - Cria uma nova empresa
- `PUT /api/companies/{id}` - Atualiza uma empresa
- `DELETE /api/companies/{id}` - Remove uma empresa

### Fornecedores
- `GET /api/suppliers` - Lista todos os fornecedores
- `GET /api/suppliers?search={termo}` - Busca fornecedores por nome ou documento
- `GET /api/suppliers/{id}` - Obtém um fornecedor específico
- `POST /api/suppliers` - Cria um novo fornecedor
- `PUT /api/suppliers/{id}` - Atualiza um fornecedor
- `DELETE /api/suppliers/{id}` - Remove um fornecedor

## Validações e Regras de Negócio

### Empresas
- CNPJ deve ser único e conter 14 dígitos numéricos
- CEP deve ser válido (validado via API cep.la)

### Fornecedores
- CPF/CNPJ deve ser único
- CPF deve conter 11 dígitos numéricos
- CNPJ deve conter 14 dígitos numéricos
- Email deve ser válido
- CEP deve ser válido (validado via API cep.la)
- Para pessoa física:
  - RG é obrigatório
  - Data de nascimento é obrigatória
  - Se o CEP for do Paraná, deve ser maior de idade
1. Configure o banco de dados PostgreSQL
2. Na pasta crud-spring:
```bash
./mvnw spring-boot:run
```

#### Frontend
1. Na pasta crud-angular:
```bash
npm install
ng serve
```

## Estrutura do Projeto

### Backend
- `/crud-spring`: Projeto Spring Boot
  - `/src/main/java/...`
    - `/controllers`: REST Controllers
    - `/models`: Entidades
    - `/repositories`: Interfaces JPA
    - `/services`: Lógica de negócio
    - `/config`: Configurações
    - `/validation`: Validadores personalizados

### Frontend
- `/crud-angular`: Projeto Angular
  - `/src/app`
    - `/components`: Componentes Angular
    - `/services`: Serviços HTTP
    - `/models`: Interfaces/Types
    - `/shared`: Componentes compartilhados
