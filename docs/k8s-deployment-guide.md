# Kubernetes Deployment Guide for Teamcast UI

This guide provides comprehensive instructions for deploying Teamcast UI to Kubernetes with proper error handling and troubleshooting.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deployment](#quick-deployment)
3. [Manual Deployment Steps](#manual-deployment-steps)
4. [Configuration Details](#configuration-details)
5. [Troubleshooting](#troubleshooting)
6. [Monitoring](#monitoring)
7. [Scaling](#scaling)

## Prerequisites

Before deploying, ensure you have:

- **Docker** installed and running
- **kubectl** configured to connect to your Kubernetes cluster
- **Kubernetes cluster** with sufficient resources (minimum 2GB RAM, 1 CPU)
- **Container registry** access (if using remote images)

## Quick Deployment

Use the automated deployment script:

```bash
# Make script executable (if not already)
chmod +x scripts/deploy-k8s.sh

# Run deployment
./scripts/deploy-k8s.sh
```

This script will:

- Build the Docker image
- Apply Kubernetes configuration
- Wait for deployment to be ready
- Verify the deployment
- Test the health endpoint

## Manual Deployment Steps

### 1. Build Docker Image

```bash
# Build the image
docker build -t teamcast-ui:latest .

# Verify the image was created
docker images | grep teamcast-ui
```

### 2. Deploy to Kubernetes

```bash
# Apply the deployment configuration
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get deployment teamcast-ui

# Wait for deployment to be ready
kubectl rollout status deployment/teamcast-ui --timeout=300s
```

### 3. Verify Deployment

```bash
# Check pod status
kubectl get pods -l app=teamcast-ui

# Check service
kubectl get service teamcast-ui-service

# Test health endpoint
kubectl run test-health --image=curlimages/curl --rm -i --restart=Never -- curl -s http://teamcast-ui-service/api/health
```

## Configuration Details

### Docker Configuration

The Dockerfile is optimized for Kubernetes deployment:

- **Multi-stage build** for smaller image size
- **Non-root user** for security
- **Health checks** for container monitoring
- **PM2 process manager** for application stability

### Kubernetes Configuration

#### Deployment (`k8s/deployment.yaml`)

- **Replicas**: 2 (configurable)
- **Resources**:
  - Requests: 1Gi memory, 250m CPU
  - Limits: 2Gi memory, 500m CPU
- **Health Checks**:
  - Liveness probe: `/api/health` endpoint
  - Readiness probe: `/api/health` endpoint
- **Security**: Non-root user, security context

#### Service

- **Type**: ClusterIP
- **Port**: 80 → 3000
- **Selector**: `app=teamcast-ui`

### PM2 Configuration

Two PM2 configurations are provided:

1. **`ecosystem.config.js`**: For local development
2. **`ecosystem.k8s.config.js`**: Optimized for Kubernetes

Kubernetes-specific optimizations:

- Single instance (let K8s handle scaling)
- Fork mode for better signal handling
- Conservative memory limits
- Improved logging

## Troubleshooting

### Common Issues

#### 1. Pod CrashLoopBackOff

**Symptoms**: Pods keep restarting
**Causes**: Application errors, resource limits, configuration issues

**Solutions**:

```bash
# Check pod logs
kubectl logs <pod-name>

# Check pod events
kubectl describe pod <pod-name>

# Check resource usage
kubectl top pods -l app=teamcast-ui
```

#### 2. 502 Bad Gateway

**Symptoms**: Service returns 502 errors
**Causes**: Application not ready, health check failures

**Solutions**:

```bash
# Check if pods are ready
kubectl get pods -l app=teamcast-ui

# Test health endpoint directly
kubectl exec -it <pod-name> -- curl -s http://localhost:3000/api/health

# Check application logs
kubectl logs <pod-name> -f
```

#### 3. Out of Memory (OOM) Kills

**Symptoms**: Pods killed due to memory limits
**Causes**: Insufficient memory limits, memory leaks

**Solutions**:

```bash
# Check memory usage
kubectl top pods -l app=teamcast-ui

# Increase memory limits in deployment.yaml
# Update the deployment
kubectl apply -f k8s/deployment.yaml
```

#### 4. Image Pull Errors

**Symptoms**: Pods stuck in ImagePullBackOff
**Causes**: Image not found, registry authentication issues

**Solutions**:

```bash
# Check image pull status
kubectl describe pod <pod-name>

# Ensure image exists locally
docker images | grep teamcast-ui

# If using remote registry, ensure proper authentication
```

### Automated Troubleshooting

Use the troubleshooting script:

```bash
# Run comprehensive troubleshooting
./scripts/k8s-troubleshoot.sh
```

This script will:

- Check cluster connectivity
- Verify deployment status
- Check pod health
- Test service connectivity
- Identify common issues
- Provide recommendations

### Debugging Commands

```bash
# Get detailed pod information
kubectl describe pod <pod-name>

# Follow pod logs
kubectl logs -f <pod-name>

# Execute commands in pod
kubectl exec -it <pod-name> -- /bin/bash

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -l app=teamcast-ui
```

## Monitoring

### Health Checks

The application provides a health check endpoint at `/api/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 123456789,
    "heapTotal": 987654321,
    "heapUsed": 123456789
  },
  "version": "v18.0.0"
}
```

### Logging

Logs are available through:

```bash
# Application logs
kubectl logs -f deployment/teamcast-ui

# PM2 logs (if needed)
kubectl exec -it <pod-name> -- pm2 logs
```

### Metrics

Monitor resource usage:

```bash
# Pod metrics
kubectl top pods -l app=teamcast-ui

# Node metrics
kubectl top nodes
```

## Scaling

### Horizontal Pod Autoscaling

Create an HPA for automatic scaling:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: teamcast-ui-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: teamcast-ui
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Manual Scaling

```bash
# Scale to specific number of replicas
kubectl scale deployment teamcast-ui --replicas=5

# Check scaling status
kubectl get deployment teamcast-ui
```

## Best Practices

1. **Resource Management**: Set appropriate resource limits and requests
2. **Health Checks**: Use dedicated health check endpoints
3. **Logging**: Implement structured logging
4. **Monitoring**: Set up proper monitoring and alerting
5. **Security**: Run containers as non-root users
6. **Backup**: Implement proper backup strategies
7. **Updates**: Use rolling updates for zero-downtime deployments

## Support

If you encounter issues:

1. Run the troubleshooting script: `./scripts/k8s-troubleshoot.sh`
2. Check the logs: `kubectl logs -f deployment/teamcast-ui`
3. Review this documentation
4. Check Kubernetes events: `kubectl get events --sort-by='.lastTimestamp'`

For persistent issues, ensure all prerequisites are met and the cluster has sufficient resources.
