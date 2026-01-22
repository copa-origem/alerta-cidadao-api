# 🚀 Alerta Cidadão API (Core Service)

![CI/CD](https://github.com/copa-origem/api-consumo-nest/actions/workflows/deploy.yml/badge.svg)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

> The backend powerhouse behind the Alerta Cidadão platform, designed for high availability and event-driven processing.

---

## 🔗 Live Documentation & Access

🟢 **Live Swagger UI:** [https://api.alertacidadaoapi.com/api](https://api.alertacidadaoapi.com/api)  
*(Try the endpoints directly in your browser!)*

---

## 📖 Context: The Evolution

This project represents a significant architectural evolution. Originally built with **Express.js (MVP)**, this system has been completely re-engineered using **NestJS**.

The goal was to transition from a monolithic script to a **Enterprise-Grade Architecture**, leveraging:
- **Event-Driven Design** with RabbitMQ (to handle heavy background tasks).
- **Real-Time Communication** via WebSockets.
- **Relational Integrity** with PostgreSQL & Prisma.
- **Automated CI/CD Pipelines** for reliable deployments on Azure.

## 🏗️ Architecture & Infrastructure

The system is deployed on **Microsoft Azure** using a containerized strategy optimized for performance and cost-efficiency.

```mermaid
graph LR
    User((Usuário))
    
    subgraph Frontend_App ["Frontend (Vercel)"]
        Next["Next.js Client"]
    end

    subgraph Internet ["Internet / DNS"]
        Domain["api.alertacidadaoapi.com"]
    end

    subgraph Azure_Infra ["Azure Cloud (Canadá)"]
        direction TB
        
        subgraph VM ["Azure VM (Linux)"]
            Nginx["Nginx (Reverse Proxy + SSL)"]
            
            subgraph Containers ["Docker Compose Cluster"]
                API["NestJS API"]
                DB[("PostgreSQL")]
                Rabbit[("RabbitMQ")]
                Redis[("Redis")]
            end
        end
    end
    
    %% CI/CD Flow
    GitHub["GitHub Repo"] -. "Actions CI/CD" .-> VM

    %% User Flow
    User -->|Acessa| Next
    
    %% Requests Flow
    Next -- "HTTPS" --> Domain
    User -- "WSS (WebSocket)" --> Domain
    
    %% Ingress Flow
    Domain -- "Port 443" --> Nginx
    
    %% Internal Docker Networking
    Nginx -- "Proxy Pass :3000" --> API
    
    API <-->|"Prisma"| DB
    API <-->|"Events"| Rabbit
    API <-->|"Cache/WS"| Redis

    %% ESTILIZAÇÃO (High Contrast)
    %% Cores fortes com texto branco para leitura fácil
    
    %% Azul para o Core (API, Banco, Fila)
    classDef container fill:#2962ff,stroke:#0039cb,stroke-width:2px,color:#ffffff;
    
    %% Verde para Entrada/Segurança (Nginx)
    classDef gateway fill:#00c853,stroke:#009624,stroke-width:2px,color:#ffffff;
    
    %% Amarelo para o DNS (Destaque visual de conexão)
    classDef dns fill:#ffd600,stroke:#fbc02d,stroke-width:2px,color:#000000;
    
    %% Cinza Escuro para Externos (User, Git, Vercel)
    classDef external fill:#263238,stroke:#000000,stroke-width:2px,color:#ffffff;
    
    %% Fundo da Cloud mais neutro
    classDef cloud fill:#f5f5f5,stroke:#90a4ae,stroke-width:2px,stroke-dasharray: 5 5,color:#37474f;
    
    %% Aplicando as classes
    class API,DB,Rabbit,Redis container;
    class Nginx gateway;
    class Domain dns;
    class GitHub,Next,User external;
    class Azure_Infra,VM cloud;
```

## ✨ Key Engineering Features
- **Event-Driven Architecture:** Uses **RabbitMQ** to decouple PDF generation from the main API. The API returns 202 Accepted immediately, and the heavy processing happens in the background.  
- **Real-Time Feedback:** MOnce the background job is done, the server pushes the result to the client via **WebSockets**.  
- **Modular Design:** Strictly follows NestJS modular architecture (Controllers, Services, Guards, DTOs).  
- **Security:**  
  - **JWT Authentication** (Middleware integrated with Firebase Auth).  
  - **Data Validation** using class-validator and DTOs.  
  - **Rate Limiting** (Throttler) to prevent abuse.
- **Testing:**
  - Unit Tests (**Jest**) for business logic.
  - E2E Tests (**Supertest**) for critial endpoints.

## ☁️ DevOps Strategy
- **CI/CD:** GitHub Actions pipeline runs tests, builds the Docker image, and deploys to Azure via SSH.  
- **Docker:** Multi-stage builds (Alpine Linux) to minimize image size and RAM usage.    
- **Nginx:** Configured as a Reverse Proxy with SSL termination (Let's Encrypt) to secure traffic.  

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **Message Broker:** RabbitMQ
- **Database:** PostgreSQL + Prisma ORM
- **Cache/WS Adapter:** Redis 
- **Cloud:** Microsoft Azure (Virtual Machines)
- **Containerization:** Docker & Docker Compose

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
  DB_USER="your_user_db"
  DB_PASS="your_db_password"
  DB_NAME="your_db_name"
  CLOUDINARY_NAME="your_cloudinary_name"
  CLOUDINARY_API_KEY="your_api_cloudinary_key"
  CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
  RABBITMQ_URL="your_rabbitmq_url"
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
http://localhost:3000/api

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
- Linkedin: https://www.linkedin.com/in/rafael-rangel1/  
- GitHub: @Rafael19722  
- Portfolio: https://rafaelrangel.vercel.app/  

*Made with 💜 and TypeScript.*
