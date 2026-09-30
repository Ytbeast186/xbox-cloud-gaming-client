# Deployment Guide

## Prerequisites

- Node.js 16+ and npm 8+
- Docker (optional, for containerized deployment)
- SSL/TLS certificates
- Cloud provider account (AWS, Azure, GCP, or your own servers)

## Local Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Generate SSL Certificates (Development)
```bash
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes
```

### 4. Start Server
```bash
npm start
```

Server will run on `http://localhost:8080`

## Docker Deployment

### 1. Build Docker Image
```bash
docker build -t xbox-cloud-gaming-client:latest .
```

### 2. Run Container
```bash
docker run -d \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e SERVER_PORT=8080 \
  -v /path/to/certs:/app/certs \
  --name gaming-client \
  xbox-cloud-gaming-client:latest
```

### 3. Docker Compose (Recommended)
```bash
docker-compose up -d
```

## Kubernetes Deployment

### 1. Create Kubernetes manifests
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gaming-client
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gaming-client
  template:
    metadata:
      labels:
        app: gaming-client
    spec:
      containers:
      - name: gaming-client
        image: xbox-cloud-gaming-client:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
```

### 2. Deploy
```bash
kubectl apply -f deployment.yaml
```

## Cloud Platforms

- **AWS EC2**: Full control, scalable, comprehensive
- **Heroku**: Simple deployment, less configuration
- **DigitalOcean**: Middle ground, good performance
- **Kubernetes**: Enterprise-grade, complex setup
