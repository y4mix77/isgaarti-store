# ISGAARTI Kubernetes Deployment

This folder uses Kustomize to separate shared Kubernetes resources from environment-specific deployment choices.

## Structure

```text
k8s/
  base/
    namespace.yml
    configmap.yml
    postgres.yml
    backend.yml
    frontend.yml
    kustomization.yml

  overlays/
    local/
      kustomization.yml
      secret.example.yml

    production/
      kustomization.yml
      production-patch.yml
      secret.example.yml
      ingress.yml
```

## Local Docker Desktop Deployment

Local mode uses the Docker images already built on your machine:

```text
storepro-backend:latest
storepro-frontend:latest
```

Create the real local secret:

```powershell
Copy-Item k8s\overlays\local\secret.example.yml k8s\overlays\local\secret.yml
notepad k8s\overlays\local\secret.yml
```

Build local images:

```powershell
docker compose -f docker-compose.prod.yml build
```

Deploy:

```powershell
kubectl apply -k k8s\overlays\local
```

Check:

```powershell
kubectl get pods -n isgaarti
kubectl get svc -n isgaarti
```

Open:

```text
http://localhost:30431
```

## Production Overlay

Production mode uses the GitHub Container Registry images published by GitHub Actions:

```text
ghcr.io/y4mix77/isgaarti-backend:latest
ghcr.io/y4mix77/isgaarti-frontend:latest
```

Create the real production secret:

```powershell
Copy-Item k8s\overlays\production\secret.example.yml k8s\overlays\production\secret.yml
notepad k8s\overlays\production\secret.yml
```

Render before applying:

```powershell
kubectl kustomize k8s\overlays\production
```

Deploy to a production Kubernetes cluster:

```powershell
kubectl apply -k k8s\overlays\production
```

## Notes

- `secret.yml` files are ignored by git.
- `secret.example.yml` files are safe templates.
- Local Kubernetes keeps `imagePullPolicy: Never`.
- Production Kubernetes switches to `imagePullPolicy: IfNotPresent`.
- Production includes `ingress.yml`; local Docker Desktop uses the fixed NodePort `30431`.
