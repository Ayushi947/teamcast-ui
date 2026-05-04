#!/bin/bash

# Kubernetes Troubleshooting Script for Teamcast UI
# This script helps diagnose common issues with the deployment

set -e

echo "🔍 Teamcast UI Kubernetes Troubleshooting Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
            echo -e "ℹ️  $message"
            ;;
    esac
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_status "ERROR" "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we can connect to the cluster
print_status "INFO" "Checking cluster connectivity..."
if kubectl cluster-info &> /dev/null; then
    print_status "SUCCESS" "Connected to Kubernetes cluster"
else
    print_status "ERROR" "Cannot connect to Kubernetes cluster"
    exit 1
fi

# Check deployment status
print_status "INFO" "Checking deployment status..."
DEPLOYMENT_STATUS=$(kubectl get deployment teamcast-ui -o jsonpath='{.status.conditions[?(@.type=="Available")].status}' 2>/dev/null || echo "NotFound")

if [ "$DEPLOYMENT_STATUS" = "True" ]; then
    print_status "SUCCESS" "Deployment is available"
elif [ "$DEPLOYMENT_STATUS" = "NotFound" ]; then
    print_status "ERROR" "Deployment 'teamcast-ui' not found"
    exit 1
else
    print_status "WARNING" "Deployment is not available"
fi

# Check pod status
print_status "INFO" "Checking pod status..."
PODS=$(kubectl get pods -l app=teamcast-ui -o jsonpath='{.items[*].metadata.name}' 2>/dev/null)

if [ -z "$PODS" ]; then
    print_status "ERROR" "No pods found for teamcast-ui"
    exit 1
fi

for pod in $PODS; do
    POD_STATUS=$(kubectl get pod $pod -o jsonpath='{.status.phase}' 2>/dev/null)
    POD_READY=$(kubectl get pod $pod -o jsonpath='{.status.containerStatuses[0].ready}' 2>/dev/null)
    
    echo "Pod: $pod"
    echo "  Status: $POD_STATUS"
    echo "  Ready: $POD_READY"
    
    if [ "$POD_STATUS" = "Running" ] && [ "$POD_READY" = "true" ]; then
        print_status "SUCCESS" "Pod $pod is running and ready"
    else
        print_status "WARNING" "Pod $pod is not ready (Status: $POD_STATUS, Ready: $POD_READY)"
        
        # Get pod events
        echo "Recent events for $pod:"
        kubectl describe pod $pod | grep -A 10 "Events:" || echo "No events found"
        
        # Get pod logs
        echo "Recent logs for $pod:"
        kubectl logs $pod --tail=20 || echo "No logs available"
    fi
done

# Check service status
print_status "INFO" "Checking service status..."
SERVICE_STATUS=$(kubectl get service teamcast-ui-service -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo "NotFound")

if [ "$SERVICE_STATUS" != "NotFound" ]; then
    print_status "SUCCESS" "Service is configured (ClusterIP: $SERVICE_STATUS)"
else
    print_status "ERROR" "Service 'teamcast-ui-service' not found"
fi

# Check resource usage
print_status "INFO" "Checking resource usage..."
kubectl top pods -l app=teamcast-ui 2>/dev/null || print_status "WARNING" "Metrics server not available"

# Check for common issues
print_status "INFO" "Checking for common issues..."

# Check for OOM kills
OOM_COUNT=$(kubectl get events --field-selector reason=OOMKilled -o jsonpath='{.items[?(@.involvedObject.name=~"teamcast-ui.*")].count}' 2>/dev/null || echo "0")
if [ "$OOM_COUNT" -gt 0 ]; then
    print_status "WARNING" "Found $OOM_COUNT OOM kill events"
fi

# Check for image pull issues
IMAGE_PULL_ERRORS=$(kubectl get events --field-selector reason=Failed -o jsonpath='{.items[?(@.involvedObject.name=~"teamcast-ui.*")].message}' 2>/dev/null | grep -i "image" || echo "")
if [ -n "$IMAGE_PULL_ERRORS" ]; then
    print_status "WARNING" "Image pull errors detected"
    echo "$IMAGE_PULL_ERRORS"
fi

# Check health endpoint
print_status "INFO" "Testing health endpoint..."
HEALTH_RESPONSE=$(kubectl run test-health --image=curlimages/curl --rm -i --restart=Never -- curl -s http://teamcast-ui-service/api/health 2>/dev/null || echo "FAILED")

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    print_status "SUCCESS" "Health endpoint is responding correctly"
else
    print_status "WARNING" "Health endpoint test failed"
    echo "Response: $HEALTH_RESPONSE"
fi

# Recommendations
echo ""
print_status "INFO" "Recommendations:"
echo "1. If pods are crashing, check the logs with: kubectl logs -f <pod-name>"
echo "2. If OOM kills occur, increase memory limits in deployment.yaml"
echo "3. If health checks fail, verify the /api/health endpoint is accessible"
echo "4. If image pull fails, ensure the Docker image is available in your registry"
echo "5. Monitor resource usage with: kubectl top pods -l app=teamcast-ui"

print_status "SUCCESS" "Troubleshooting complete!" 