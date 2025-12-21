# 🚀 NestJS API Migration (Express to NestJS)

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

## 📖 About the Project

This project represents a significant architectural evolution. Originally built with **Express.js and Firebase (NoSQL)**, this backend has been completely rewritten and migrated to **NestJS and PostgreSQL**.

The goal of this migration was to adopt a more structured, scalable, and maintainable architecture, leveraging:
- **Dependency Injection** provided by NestJS.
- **Relational Data Integrity** with PostgreSQL.
- **Type Safety** with TypeScript and DTOs.
- **Automated Testing** (Unit & E2E).

## ✨ Features

- **Architecture:** Modular structure using NestJS (Controllers, Services, Modules).
- **Database:** PostgreSQL containerized with Docker.
- **ORM:** Prisma ORM for schema modeling and migrations.
- **Validation:** Global Pipes and DTOs using `class-validator` to ensure data integrity.
- **Documentation:** Auto-generated API documentation with Swagger (OpenAPI).
- **Testing:**
  - Unit Tests (Jest) for Services.
  - E2E Tests (Supertest) for API Endpoints.
- **Seeding:** Scripts to populate the database with initial data.

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Containerization:** Docker & Docker Compose
- **Testing:** Jest & Supertest
- **Docs:** Swagger UI

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker Desktop installed and running

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/copa-origem/api-consumo-nest.git
   cd api-consumo-nest
   ```

2. **Install dependencies**
  ```bash
  npm install
  ```

3. **Environment Setup**  
  Create a .env file in the root directory based on .env.example
  ```bash
  DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"
  CLOUDINARY_NAME="your_cloudinary_name"
  CLOUDINARY_API_KEY="your_api_cloudinary_key"
  CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
  ```
  **Don't forget to add the firebase-config.json in the root**  

4. **Start the Database**
  Use Docker Compose to spin up the PostgreSQL container:  
  ```bash
  docker compose up -d
  ```

5. **Database Migration & Seeding**
  Push the schema to the database and run the seed script:  
  ```bash
  npx prisma migrate dev
  npx prisma db seed
  ```

6. **Run the Application**
  ```bash
  npm run start:dev
  ```
  The server will start at http://localhost:3000.

## 📚 API Documentation  
Once the application is running, you can acces the interactive Swagger documentation at:  
http://localhost:3000/api/docs

## 🧪 Running Tests  
To ensure everything is working correctly, run the test suites:
  ```bash
  # Unit tests
  npm run test

  # End-to-End tests
  npm run test:e2e

  # Test coverage
  npm run test:cov
  ```

## 👤 Author  
**Rafael Silva Rangel de Almeida**  
- Linkedin: https://www.linkedin.com/in/rafael-silva-rangel-de-almeida-319b942bb/  
- GitHub: @Rafael19722  

*Made with 💜 and TypeScript.*
