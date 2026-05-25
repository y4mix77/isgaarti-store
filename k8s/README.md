# ISGAARTI Kubernetes Local Deployment

These manifests deploy the Dockerized project to Docker Desktop Kubernetes.

## 1. Build images locally

```powershell
docker compose -f docker-compose.prod.yml build
```

## 2. Create a real Kubernetes secret

Copy `02-secret.example.yml` to `02-secret.yml`, fill the real values, and keep `02-secret.yml` private.

```powershell
Copy-Item k8s\02-secret.example.yml k8s\02-secret.yml
```

## 3. Deploy

```powershell
kubectl apply -f k8s\00-namespace.yml
kubectl apply -f k8s\01-configmap.yml
kubectl apply -f k8s\02-secret.yml
kubectl apply -f k8s\03-postgres.yml
kubectl apply -f k8s\04-backend.yml
kubectl apply -f k8s\05-frontend.yml
```

## 4. Check status

```powershell
kubectl get pods -n isgaarti
kubectl get svc -n isgaarti
```

## 5. Open frontend

Docker Desktop should expose the frontend LoadBalancer on:

```text
http://localhost:4301
```

If the LoadBalancer does not expose the port, use port-forward:

```powershell
kubectl port-forward -n isgaarti svc/frontend 4301:4301
```

## Optional ingress

`06-ingress.yml` is ready for a local or cloud ingress controller. For Docker Desktop, a simple LoadBalancer service is usually enough.
