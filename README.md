#  Code Engine — Full Stack Code Execution Platform
Full Stack Code Execution Platform — Execute, Scale, and Securely Run User Code in Real Time



##  Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Key Components](#-key-components)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Performance Metrics](#-performance-metrics)
- [Key Concepts](#-key-concepts)
- [Contributing](#-contributing)
- [License](#-license)

---

##  Overview

**Code Engine** is a full-stack code execution platform that enables users to run code in multiple programming languages through an intuitive web interface.  
Built with **security** and **scalability** at its core, the platform executes each code submission inside an isolated **Docker container**, ensuring safety and resource fairness.

The system leverages:
- **RabbitMQ** for distributed task queuing  
- **Redis** for caching and real-time communication  
- **Kubernetes** for dynamic scaling and orchestration of worker nodes  

---

##  Features

-  **Multi-language Support** — Execute code in multiple programming languages  
-  **Isolated Execution** — Each code run executes in a sandboxed Docker container  
-  **Real-time Updates** — Live output streaming to the frontend via Redis Pub/Sub  
-  **Scalable Architecture** — Auto-scaling workers with Kubernetes HPA  
-  **Async Processing** — RabbitMQ-based queue system for concurrent requests  
-  **Result Caching** — Redis-powered caching for improved performance  
-  **Resource Limits** — CPU and memory constraints to prevent abuse  
-  **High Availability** — 99.9% uptime with fault-tolerant design  

---

##  Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React.js |
| **Backend** | Node.js, Express.js |
| **Execution Engine** | Docker |
| **Message Queue** | RabbitMQ |
| **Cache & Real-time** | Redis |
| **Orchestration** | Kubernetes |
| **Containerization** | Docker Compose (Dev), K8s (Prod) |

---

##  System Architecture
```
┌─────────────────┐
│  React Frontend │
│   (Code Editor) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express API    │
│    Server       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    RabbitMQ     │
│  Message Queue  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Worker Service  │
│ (Docker Sandbox)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Redis       │
│ Cache & Pub/Sub │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend       │
│ (Real-time Out) │
└─────────────────┘
```

###  Execution Flow

1. User submits code via the **React frontend editor**.  
2. **Express API** validates the request and pushes the job to **RabbitMQ**.  
3. Worker pods consume jobs from the queue.  
4. **Docker containers** execute code in isolated environments with resource limits.  
5. Results are cached in **Redis** and published via **Pub/Sub**.  
6. Frontend receives **real-time output** through Redis subscription.  

---

##  Key Components

###  Docker
- Runs user code in **isolated containers**.  
- Implements **CPU/RAM resource limits** for security.  
- Uses **ephemeral containers** destroyed after each execution.

###  RabbitMQ
- Implements the **producer–consumer pattern** for distributed processing.  
- Handles concurrent executions with message acknowledgments.  
- Ensures fault tolerance with **persistent queues**.

###  Redis
- Caches execution results — improves response time by **35%**.  
- Real-time **Pub/Sub** for frontend updates.  
- **TTL-based expiration** for automatic cleanup.

###  Kubernetes
- Auto-scaling via **Horizontal Pod Autoscaler (HPA)**.  
- Load balancing across worker nodes.  
- Self-healing pods and optimized resource allocation.

###  Express.js API
- Validates and sanitizes requests.  
- Pushes jobs to RabbitMQ queue.  
- Provides RESTful endpoints for code submission and status checks.

###  React.js Frontend
- Interactive code editor with syntax highlighting.  
- Real-time output streaming and execution feedback.  
- Multi-language selection and responsive design.

---

##  Getting Started

###  Prerequisites
- Docker & Docker Compose  
- Node.js (v16+)  
- Kubernetes cluster (for production)

###  Development Setup

```
# Clone the repository
git clone https://github.com/yourusername/code-engine.git
cd code-engine

# Install dependencies
npm install

# Start services with Docker Compose
docker-compose up -d

# Start the development server
npm run dev

# API Configuration
PORT=5000
NODE_ENV=development

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Docker
DOCKER_HOST=unix:///var/run/docker.sock
# Apply Kubernetes configurations
kubectl apply -f k8s/

# Verify deployment
kubectl get pods
kubectl get services

# Enable autoscaling
kubectl autoscale deployment worker --cpu-percent=70 --min=2 --max=10
