#!/bin/bash

# Quick Fix Script for Teamcast UI Kubernetes Issues
# This script provides immediate fixes for common 502 and pod crash issues

set -e

echo "🔧 Teamcast UI Quick Fix Script"
echo "==============================="

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

print_status "INFO" "Starting quick fix process..."

# 1. Stop current deployment
print_status "INFO" "Stopping current deployment..."
kubectl delete deployment teamcast-ui --ignore-not-found=true
kubectl delete service teamcast-ui-service --ignore-not-found=true

# Wait for cleanup
sleep 10

# 2. Build fresh Docker image
print_status "INFO" "Building fresh Docker image..."
if docker build -t teamcast-ui:latest .; then
    print_status "SUCCESS" "Docker image built successfully"
else
    print_status "ERROR" "Failed to build Docker image"
    exit 1
fi

# 3. Apply updated configuration
print_status "INFO" "Applying updated configuration..."
if kubectl apply -f k8s/deployment.yaml; then
    print_status "SUCCESS" "Configuration applied"
else
    print_status "ERROR" "Failed to apply configuration"
    exit 1
fi

# 4. Wait for deployment
print_status "INFO" "Waiting for deployment to be ready..."
if kubectl rollout status deployment/teamcast-ui --timeout=300s; then
    print_status "SUCCESS" "Deployment is ready"
else
    print_status "WARNING" "Deployment may still be starting"
fi

# 5. Check pod status
print_status "INFO" "Checking pod status..."
sleep 30

PODS=$(kubectl get pods -l app=teamcast-ui -o jsonpath='{.items[*].metadata.name}' 2>/dev/null)
if [ -z "$PODS" ]; then
    print_status "ERROR" "No pods found"
    exit 1
fi

for pod in $PODS; do
    POD_STATUS=$(kubectl get pod $pod -o jsonpath='{.status.phase}' 2>/dev/null)
    POD_READY=$(kubectl get pod $pod -o jsonpath='{.status.containerStatuses[0].ready}' 2>/dev/null)
    
    echo "Pod: $pod - Status: $POD_STATUS - Ready: $POD_READY"
    
    if [ "$POD_STATUS" != "Running" ] || [ "$POD_READY" != "true" ]; then
        print_status "WARNING" "Pod $pod is not ready"
        
        # Show recent logs
        echo "Recent logs for $pod:"
        kubectl logs $pod --tail=10 || echo "No logs available"
    else
        print_status "SUCCESS" "Pod $pod is running and ready"
    fi
done

# 6. Test health endpoint
print_status "INFO" "Testing health endpoint..."
sleep 10

HEALTH_RESPONSE=$(kubectl run test-health --image=curlimages/curl --rm -i --restart=Never -- curl -s http://teamcast-ui-service/api/health 2>/dev/null || echo "FAILED")

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    print_status "SUCCESS" "Health endpoint is responding correctly"
else
    print_status "WARNING" "Health endpoint test failed"
    echo "Response: $HEALTH_RESPONSE"
    
    # Try alternative health check
    print_status "INFO" "Trying alternative health check..."
    ALTERNATIVE_RESPONSE=$(kubectl run test-health-alt --image=curlimages/curl --rm -i --restart=Never -- curl -s http://teamcast-ui-service/ 2>/dev/null || echo "FAILED")
    
    if [ "$ALTERNATIVE_RESPONSE" != "FAILED" ]; then
        print_status "SUCCESS" "Application is responding on root endpoint"
    else
        print_status "ERROR" "Application is not responding"
    fi
fi

# 7. Show final status
echo ""
print_status "INFO" "Final Status:"
kubectl get deployment teamcast-ui
kubectl get pods -l app=teamcast-ui
kubectl get service teamcast-ui-service

print_status "SUCCESS" "Quick fix completed!"
echo ""
print_status "INFO" "If issues persist:"
echo "1. Run: ./scripts/k8s-troubleshoot.sh"
echo "2. Check logs: kubectl logs -f deployment/teamcast-ui"
echo "3. Check events: kubectl get events --sort-by='.lastTimestamp'" 