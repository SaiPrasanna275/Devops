#!/bin/bash

# MedTracker Pro Deployment Script
set -e

echo "🚀 Starting MedTracker Pro deployment..."

# Configuration
ENVIRONMENT=${1:-staging}
AWS_REGION=${AWS_REGION:-us-west-2}
CLUSTER_NAME="medtracker-cluster"
NAMESPACE="medtracker-${ENVIRONMENT}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check required tools
check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_tools=()
    
    if ! command -v docker &> /dev/null; then
        missing_tools+=("docker")
    fi
    
    if ! command -v kubectl &> /dev/null; then
        missing_tools+=("kubectl")
    fi
    
    if ! command -v aws &> /dev/null; then
        missing_tools+=("aws")
    fi
    
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi
    
    print_status "All dependencies satisfied ✓"
}

# Build and push Docker image
build_and_push() {
    print_status "Building Docker image..."
    
    local image_tag=$(git rev-parse --short HEAD)
    local registry_url="ghcr.io/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')"
    local full_image_name="${registry_url}:${image_tag}"
    
    docker build -t "${full_image_name}" .
    docker tag "${full_image_name}" "${registry_url}:latest"
    
    print_status "Pushing image to registry..."
    docker push "${full_image_name}"
    docker push "${registry_url}:latest"
    
    echo "IMAGE_TAG=${image_tag}" > .env.deploy
    echo "FULL_IMAGE_NAME=${full_image_name}" >> .env.deploy
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."
    
    cd terraform
    
    terraform init
    terraform plan -var="environment=${ENVIRONMENT}" -out=tfplan
    terraform apply tfplan
    
    # Get outputs
    DB_ENDPOINT=$(terraform output -raw rds_endpoint)
    REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)
    
    echo "DB_ENDPOINT=${DB_ENDPOINT}" >> ../.env.deploy
    echo "REDIS_ENDPOINT=${REDIS_ENDPOINT}" >> ../.env.deploy
    
    cd ..
}

# Update Kubernetes cluster configuration
configure_kubectl() {
    print_status "Configuring kubectl..."
    aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}
}

# Create Kubernetes namespace
create_namespace() {
    print_status "Creating Kubernetes namespace..."
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
}

# Deploy secrets to Kubernetes
deploy_secrets() {
    print_status "Deploying secrets..."
    
    # Create secrets from environment variables
    kubectl create secret generic medtracker-secrets \
        --from-literal=database-url="${DATABASE_URL}" \
        --from-literal=openai-api-key="${OPENAI_API_KEY}" \
        --namespace=${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
    
    kubectl create secret generic postgres-secrets \
        --from-literal=username="${DB_USERNAME:-medtracker}" \
        --from-literal=password="${DB_PASSWORD}" \
        --namespace=${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
    
    kubectl create secret generic redis-secrets \
        --from-literal=password="${REDIS_PASSWORD:-medtracker123}" \
        --namespace=${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
}

# Deploy application to Kubernetes
deploy_application() {
    print_status "Deploying application..."
    
    source .env.deploy
    
    # Update image tag in deployment
    sed "s|ghcr.io/medtracker/medtracker:latest|${FULL_IMAGE_NAME}|g" k8s/base/deployment.yaml > k8s/deployment-${ENVIRONMENT}.yaml
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/base/ --namespace=${NAMESPACE}
    kubectl apply -f k8s/deployment-${ENVIRONMENT}.yaml --namespace=${NAMESPACE}
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/medtracker-app --namespace=${NAMESPACE} --timeout=300s
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Get a pod name
    POD_NAME=$(kubectl get pods -l app=medtracker -n ${NAMESPACE} -o jsonpath='{.items[0].metadata.name}')
    
    # Run migrations inside the pod
    kubectl exec -n ${NAMESPACE} ${POD_NAME} -- npm run db:migrate
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Get service external IP/URL
    SERVICE_URL=$(kubectl get service medtracker-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    
    if [ -z "$SERVICE_URL" ]; then
        SERVICE_URL=$(kubectl get service medtracker-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    fi
    
    if [ -z "$SERVICE_URL" ]; then
        print_warning "Service URL not available, using port-forward for health check"
        kubectl port-forward service/medtracker-service 8080:80 -n ${NAMESPACE} &
        PORT_FORWARD_PID=$!
        sleep 5
        SERVICE_URL="localhost:8080"
    fi
    
    # Wait for service to be ready
    for i in {1..30}; do
        if curl -f "http://${SERVICE_URL}/api/health" > /dev/null 2>&1; then
            print_status "Health check passed ✓"
            break
        fi
        
        if [ $i -eq 30 ]; then
            print_error "Health check failed after 30 attempts"
            exit 1
        fi
        
        print_status "Waiting for service to be ready... (attempt $i/30)"
        sleep 10
    done
    
    # Cleanup port-forward if used
    if [ ! -z "$PORT_FORWARD_PID" ]; then
        kill $PORT_FORWARD_PID
    fi
}

# Cleanup
cleanup() {
    print_status "Cleaning up..."
    rm -f .env.deploy
    rm -f k8s/deployment-${ENVIRONMENT}.yaml
}

# Main deployment flow
main() {
    print_status "Deploying MedTracker Pro to ${ENVIRONMENT} environment"
    
    check_dependencies
    build_and_push
    deploy_infrastructure
    configure_kubectl
    create_namespace
    deploy_secrets
    deploy_application
    run_migrations
    health_check
    cleanup
    
    print_status "🎉 Deployment completed successfully!"
    print_status "Application is available at: ${SERVICE_URL}"
}

# Handle script termination
trap cleanup EXIT

# Run main function
main "$@"