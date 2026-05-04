#!/bin/bash

# Kubernetes Deployment Script for Teamcast UI
# This script automates the deployment process with proper error handling

set -e

echo "🚀 Teamcast UI Kubernetes Deployment Script"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Configuration
IMAGE_NAME="teamcast-ui"
IMAGE_TAG="latest"
NAMESPACE="default"
DEPLOYMENT_FILE="k8s/deployment.yaml"

# Check prerequisites
print_status "INFO" "Checking prerequisites..."

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_status "ERROR" "Docker is not running"
    exit 1
fi

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_status "ERROR" "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we can connect to the cluster
if ! kubectl cluster-info &> /dev/null; then
    print_status "ERROR" "Cannot connect to Kubernetes cluster"
    exit 1
fi

print_status "SUCCESS" "Prerequisites check passed"

# Build Docker image
print_status "INFO" "Building Docker image..."
if docker build -t $IMAGE_NAME:$IMAGE_TAG .; then
    print_status "SUCCESS" "Docker image built successfully"
else
    print_status "ERROR" "Failed to build Docker image"
    exit 1
fi

# Check if image exists
if ! docker images | grep -q "$IMAGE_NAME.*$IMAGE_TAG"; then
    print_status "ERROR" "Docker image not found after build"
    exit 1
fi

# Apply Kubernetes configuration
print_status "INFO" "Applying Kubernetes configuration..."
if kubectl apply -f $DEPLOYMENT_FILE; then
    print_status "SUCCESS" "Kubernetes configuration applied"
else
    print_status "ERROR" "Failed to apply Kubernetes configuration"
    exit 1
fi

# Wait for deployment to be ready
print_status "INFO" "Waiting for deployment to be ready..."
if kubectl rollout status deployment/teamcast-ui --timeout=300s; then
    print_status "SUCCESS" "Deployment is ready"
else
    print_status "ERROR" "Deployment failed to become ready"
    
    # Show deployment status
    echo "Deployment status:"
    kubectl describe deployment teamcast-ui
    
    # Show pod status
    echo "Pod status:"
    kubectl get pods -l app=teamcast-ui
    
    exit 1
fi

# Verify deployment
print_status "INFO" "Verifying deployment..."

# Check if pods are running
PODS=$(kubectl get pods -l app=teamcast-ui -o jsonpath='{.items[*].metadata.name}')
for pod in $PODS; do
    POD_STATUS=$(kubectl get pod $pod -o jsonpath='{.status.phase}')
    if [ "$POD_STATUS" = "Running" ]; then
        print_status "SUCCESS" "Pod $pod is running"
    else
        print_status "WARNING" "Pod $pod is not running (Status: $POD_STATUS)"
    fi
done

# Check service
SERVICE_IP=$(kubectl get service teamcast-ui-service -o jsonpath='{.spec.clusterIP}')
if [ -n "$SERVICE_IP" ]; then
    print_status "SUCCESS" "Service is configured (ClusterIP: $SERVICE_IP)"
else
    print_status "WARNING" "Service configuration issue"
fi

# Test health endpoint
print_status "INFO" "Testing health endpoint..."
sleep 10  # Wait for application to fully start

HEALTH_RESPONSE=$(kubectl run test-health --image=curlimages/curl --rm -i --restart=Never -- curl -s http://teamcast-ui-service/api/health 2>/dev/null || echo "FAILED")

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    print_status "SUCCESS" "Health endpoint is responding correctly"
else
    print_status "WARNING" "Health endpoint test failed"
    echo "Response: $HEALTH_RESPONSE"
fi

# Show final status
echo ""
print_status "INFO" "Deployment Summary:"
kubectl get deployment teamcast-ui
kubectl get pods -l app=teamcast-ui
kubectl get service teamcast-ui-service

print_status "SUCCESS" "Deployment completed successfully!"
echo ""
print_status "INFO" "Next steps:"
echo "1. Monitor the deployment: kubectl logs -f deployment/teamcast-ui"
echo "2. Check resource usage: kubectl top pods -l app=teamcast-ui"
echo "3. Run troubleshooting if needed: ./scripts/k8s-troubleshoot.sh"
echo "4. Access the application through your ingress or load balancer" 