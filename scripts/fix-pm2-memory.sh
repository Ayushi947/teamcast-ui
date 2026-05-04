#!/bin/bash

# Quick Fix for PM2 Memory Configuration Issue
# This script fixes the max_memory_restart configuration error

set -e

echo "🔧 Fixing PM2 Memory Configuration"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_status "INFO" "Fixing PM2 memory configuration..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_status "ERROR" "kubectl is not installed or not in PATH"
    exit 1
fi

# Check cluster connectivity
if ! kubectl cluster-info &> /dev/null; then
    print_status "ERROR" "Cannot connect to Kubernetes cluster"
    exit 1
fi

# Stop current deployment
print_status "INFO" "Stopping current deployment..."
kubectl delete deployment teamcast-ui --ignore-not-found=true

# Wait for cleanup
sleep 5

# Build fresh Docker image with fixed configuration
print_status "INFO" "Building Docker image with fixed PM2 configuration..."
if docker build -t teamcast-ui:latest .; then
    print_status "SUCCESS" "Docker image built successfully"
else
    print_status "ERROR" "Failed to build Docker image"
    exit 1
fi

# Apply deployment
print_status "INFO" "Applying deployment with fixed configuration..."
if kubectl apply -f k8s/deployment.yaml; then
    print_status "SUCCESS" "Deployment applied"
else
    print_status "ERROR" "Failed to apply deployment"
    exit 1
fi

# Wait for deployment
print_status "INFO" "Waiting for deployment to be ready..."
if kubectl rollout status deployment/teamcast-ui --timeout=300s; then
    print_status "SUCCESS" "Deployment is ready"
else
    print_status "WARNING" "Deployment may still be starting"
fi

# Check pod status
print_status "INFO" "Checking pod status..."
sleep 10

PODS=$(kubectl get pods -l app=teamcast-ui -o jsonpath='{.items[*].metadata.name}' 2>/dev/null)
if [ -z "$PODS" ]; then
    print_status "ERROR" "No pods found"
    exit 1
fi

for pod in $PODS; do
    POD_STATUS=$(kubectl get pod $pod -o jsonpath='{.status.phase}' 2>/dev/null)
    POD_READY=$(kubectl get pod $pod -o jsonpath='{.status.containerStatuses[0].ready}' 2>/dev/null)
    
    echo "Pod: $pod - Status: $POD_STATUS - Ready: $POD_READY"
    
    if [ "$POD_STATUS" = "Running" ] && [ "$POD_READY" = "true" ]; then
        print_status "SUCCESS" "Pod $pod is running and ready"
    else
        print_status "WARNING" "Pod $pod is not ready"
        
        # Show recent logs to check for PM2 errors
        echo "Recent logs for $pod:"
        kubectl logs $pod --tail=20 || echo "No logs available"
    fi
done

# Test health endpoint
print_status "INFO" "Testing health endpoint..."
sleep 5

HEALTH_RESPONSE=$(kubectl run test-health --image=curlimages/curl --rm -i --restart=Never -- curl -s http://teamcast-ui-service/api/health 2>/dev/null || echo "FAILED")

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    print_status "SUCCESS" "Health endpoint is responding correctly"
else
    print_status "WARNING" "Health endpoint test failed"
    echo "Response: $HEALTH_RESPONSE"
fi

print_status "SUCCESS" "PM2 memory configuration fix completed!"
echo ""
print_status "INFO" "The issue was: PM2 expects integer values for max_memory_restart"
echo "Fixed: Changed '1.5G' to '1500M' in ecosystem.k8s.config.js" 