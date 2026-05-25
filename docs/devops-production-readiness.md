# Chapitre DevOps et Préparation à la Production

## 1. Objectif de la démarche DevOps

L’objectif de cette partie DevOps est de préparer l’application **ISGAARTI Store** à un déploiement professionnel, reproductible et sécurisé.  
Le projet n’est plus seulement exécutable en local depuis un IDE, mais il devient capable d’être lancé dans des environnements proches de la production grâce à Docker, Kubernetes, GitHub Actions et GitHub Container Registry.

Cette démarche permet de garantir :

- une configuration propre entre développement et production ;
- une meilleure sécurité des secrets ;
- un lancement automatisé des services ;
- une validation automatique du code ;
- une publication automatique des images Docker ;
- une base solide pour un futur déploiement cloud.

Statut atteint :

```text
Projet cloud-ready, mais pas encore cloud-hosted.
```

Cela signifie que le projet est préparé pour le cloud, mais qu’il n’est pas encore hébergé sur une plateforme cloud publique.

**Capture à insérer ici :**  
Capture du dépôt GitHub du projet `isgaarti-store`, montrant la structure globale du projet.

---

## 2. Configuration de production

La première étape a été de rendre la configuration backend compatible avec un environnement de production.

Avant, certaines valeurs sensibles pouvaient être écrites directement dans `application.properties`.  
Cette approche n’est pas recommandée, car elle expose des informations confidentielles comme :

- le mot de passe PostgreSQL ;
- la clé secrète JWT ;
- la clé secrète Stripe ;
- la clé privée ImageKit.

La configuration a donc été transformée pour lire les valeurs depuis des variables d’environnement.

Exemple :

```properties
spring.datasource.password=${DATABASE_PASSWORD:}
boutique.app.jwtSecret=${JWT_SECRET:CHANGE_ME_USE_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS}
stripe.secret.key=${STRIPE_SECRET_KEY:}
imagekit.private.key=${IMAGEKIT_PRIVATE_KEY:}
```

Cette approche permet d’avoir un même code source pour plusieurs environnements :

```text
Développement local
Docker Compose
Kubernetes local
Production cloud
```

Les vraies valeurs sont placées dans des fichiers locaux ignorés par Git :

```text
.env
k8s/overlays/local/secret.yml
k8s/overlays/production/secret.yml
```

Des fichiers exemples sont fournis pour documenter les variables attendues :

```text
.env.example
k8s/overlays/local/secret.example.yml
k8s/overlays/production/secret.example.yml
```

**Capture à insérer ici :**  
Capture de `application.properties` montrant les variables `${...}` sans afficher de vrais secrets.

**Capture à insérer ici :**  
Capture de `.env.example` montrant uniquement les valeurs exemples.

---

## 3. Sécurisation des secrets

Une règle importante a été appliquée : les secrets réels ne doivent jamais être poussés sur GitHub.

Les fichiers suivants sont ignorés par Git :

```text
.env
k8s/02-secret.yml
k8s/overlays/*/secret.yml
```

Ils sont protégés dans `.gitignore`.

Exemple :

```gitignore
.env
.env.*
!.env.example
k8s/02-secret.yml
k8s/overlays/*/secret.yml
```

Lors d’un push vers GitHub, une protection automatique a détecté une clé Stripe exposée.  
La clé a été supprimée de `application.properties`, puis l’historique Git a été nettoyé afin que le secret ne reste pas dans le dépôt.

Cette étape montre une bonne pratique de sécurité :

```text
Détection -> Suppression -> Nettoyage de l’historique -> Rotation recommandée de la clé
```

**Capture à insérer ici :**  
Capture du fichier `.gitignore` montrant les fichiers secrets ignorés.

**Capture à insérer ici :**  
Capture GitHub montrant que le push est accepté après suppression des secrets.

---

## 4. Dockerisation de l’application

L’application a été dockerisée en séparant le frontend, le backend et la base de données.

Architecture Docker :

```text
Angular Frontend  -> conteneur Nginx
Spring Boot API   -> conteneur Java
PostgreSQL        -> conteneur base de données
```

Fichiers ajoutés :

```text
frontend/Dockerfile
frontend/nginx.conf
frontend/.dockerignore
backend/boutique/Dockerfile
backend/boutique/.dockerignore
docker-compose.prod.yml
```

Le frontend Angular est compilé en mode production puis servi avec Nginx.

Le backend Spring Boot est compilé avec Maven puis exécuté dans une image Java légère.

La base PostgreSQL est lancée avec un volume Docker afin de conserver les données.

Commande utilisée :

```powershell
docker compose -f docker-compose.prod.yml up --build -d
```

Vérification :

```powershell
docker compose -f docker-compose.prod.yml ps
```

URLs locales :

```text
Frontend : http://localhost:4301
Backend  : http://localhost:8080/api/health
```

**Capture à insérer ici :**  
Capture du terminal montrant `docker compose ... up --build -d` avec les conteneurs démarrés.

**Capture à insérer ici :**  
Capture de `docker compose ps` montrant `isgaarti-frontend`, `isgaarti-backend` et `isgaarti-postgres`.

**Capture à insérer ici :**  
Capture du navigateur sur `http://localhost:8080/api/health` montrant `status: UP`.

---

## 5. Health Check backend

Un endpoint de santé a été ajouté au backend :

```text
GET /api/health
```

Exemple de réponse :

```json
{
  "status": "UP",
  "service": "isgaarti-backend",
  "timestamp": "2026-05-25T01:51:10Z"
}
```

Ce endpoint est important car il permet à Docker, Kubernetes ou un load balancer de vérifier si le backend est disponible.

Il est aussi utilisé dans Kubernetes pour :

- `readinessProbe` : savoir si le service peut recevoir du trafic ;
- `livenessProbe` : savoir si le conteneur doit être redémarré.

**Capture à insérer ici :**  
Capture du fichier `HealthController.java`.

**Capture à insérer ici :**  
Capture du navigateur affichant `/api/health`.

---

## 6. Kubernetes local avec Docker Desktop

Après Docker Compose, le projet a été préparé pour Kubernetes.

Kubernetes permet de gérer les conteneurs de manière plus professionnelle :

- redémarrage automatique ;
- isolation des services ;
- gestion des secrets ;
- services internes ;
- probes de santé ;
- préparation au déploiement cloud.

Les premiers manifests Kubernetes concernaient :

```text
Namespace
ConfigMap
Secret
PostgreSQL
Backend
Frontend
Ingress
```

Le projet a été déployé localement avec Docker Desktop Kubernetes.

Commande de vérification :

```powershell
kubectl get pods -n isgaarti
kubectl get svc -n isgaarti
```

Le frontend local Kubernetes est exposé via :

```text
http://localhost:30431
```

**Capture à insérer ici :**  
Capture Docker Desktop montrant Kubernetes activé.

**Capture à insérer ici :**  
Capture de `kubectl get nodes` montrant le noeud `docker-desktop` en état `Ready`.

**Capture à insérer ici :**  
Capture de `kubectl get pods -n isgaarti` montrant les pods `Running`.

**Capture à insérer ici :**  
Capture de `kubectl get svc -n isgaarti`.

---

## 7. Séparation des environnements avec Kustomize

Pour rendre Kubernetes plus propre et plus professionnel, les manifests ont été restructurés avec Kustomize.

Nouvelle structure :

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

Le dossier `base` contient les ressources communes.  
Les dossiers `overlays` contiennent les différences entre local et production.

Déploiement local :

```powershell
kubectl apply -k k8s\overlays\local
```

Déploiement production :

```powershell
kubectl apply -k k8s\overlays\production
```

Différence principale :

```text
Local:
  images locales Docker
  imagePullPolicy: Never
  NodePort 30431

Production:
  images GHCR
  imagePullPolicy: IfNotPresent
  Ingress
```

Cette séparation permet de garder une même base Kubernetes tout en adaptant le comportement selon l’environnement.

**Capture à insérer ici :**  
Capture de l’arborescence `k8s/base` et `k8s/overlays`.

**Capture à insérer ici :**  
Capture du fichier `k8s/overlays/production/kustomization.yml`.

**Capture à insérer ici :**  
Capture du terminal avec `kubectl apply -k k8s\overlays\local`.

---

## 8. GitHub Actions : intégration continue

Un pipeline CI a été ajouté avec GitHub Actions.

Fichier :

```text
.github/workflows/ci.yml
```

Le pipeline est exécuté automatiquement à chaque push vers :

```text
main
master
develop
```

Étapes du pipeline :

```text
1. Compilation backend Spring Boot
2. Build frontend Angular
3. Build des images Docker
4. Validation des manifests Kubernetes
5. Publication des images Docker vers GHCR
```

Cette automatisation permet de détecter rapidement :

- une erreur Java ;
- une erreur Angular ;
- une erreur Docker ;
- une erreur YAML Kubernetes ;
- un problème de build d’image.

Cela évite de découvrir les erreurs uniquement au moment du déploiement.

**Capture à insérer ici :**  
Capture du fichier `.github/workflows/ci.yml`.

**Capture à insérer ici :**  
Capture GitHub Actions montrant les jobs :
`Backend Compile`, `Frontend Build`, `Docker Images`, `Kubernetes Manifests`, `Publish GHCR Images`.

**Capture à insérer ici :**  
Capture GitHub Actions avec tous les jobs en vert.

---

## 9. Publication des images Docker avec GitHub Container Registry

Après validation du code, GitHub Actions publie automatiquement les images Docker dans GitHub Container Registry.

Registry utilisée :

```text
ghcr.io
```

Images publiées :

```text
ghcr.io/y4mix77/isgaarti-backend:latest
ghcr.io/y4mix77/isgaarti-frontend:latest
```

Des tags immuables basés sur le commit sont aussi créés :

```text
ghcr.io/y4mix77/isgaarti-backend:<commit-sha>
ghcr.io/y4mix77/isgaarti-frontend:<commit-sha>
```

Le tag `latest` est pratique pour les tests et les démonstrations.  
Le tag `<commit-sha>` est plus professionnel car il permet de savoir exactement quelle version du code est déployée.

Cette étape transforme le projet en artefacts déployables :

```text
Code source -> Build CI -> Image Docker -> Registry -> Kubernetes
```

**Capture à insérer ici :**  
Capture GitHub Actions du job `Publish GHCR Images`.

**Capture à insérer ici :**  
Capture de l’onglet `Packages` du dépôt GitHub montrant les images backend et frontend.

---

## 10. Architecture DevOps finale

L’architecture DevOps actuelle peut être résumée ainsi :

```text
Développeur
  |
  | git push
  v
GitHub Repository
  |
  v
GitHub Actions CI
  |
  | compile backend
  | build frontend
  | build Docker images
  | validate Kubernetes
  v
GitHub Container Registry
  |
  | images Docker
  v
Kubernetes local ou futur cluster cloud
  |
  | frontend pod
  | backend pod
  | postgres pod ou base externe
  v
Utilisateur final
```

Niveau atteint :

```text
DevOps global: environ 70%
CI/CD local et registry: environ 85%
Déploiement cloud réel: environ 45%
```

Après un déploiement cloud réel avec HTTPS, monitoring et backup, le projet pourrait atteindre environ :

```text
85% à 95%
```

**Capture à insérer ici :**  
Schéma DevOps global. Vous pouvez le créer dans draw.io avec les blocs ci-dessus.

---

## 11. Limites actuelles

Même si la base DevOps est solide, certaines étapes ne sont pas encore finalisées :

- le projet n’est pas encore hébergé sur un cloud public ;
- il n’y a pas encore de domaine officiel ;
- HTTPS n’est pas encore configuré ;
- le monitoring n’est pas encore installé ;
- la stratégie de sauvegarde PostgreSQL n’est pas encore automatisée ;
- le déploiement cloud Oracle/k3s est préparé mais pas encore réalisé.

Il est donc important de présenter cette partie comme :

```text
Préparation avancée à la production et au déploiement cloud.
```

Et non comme :

```text
Déploiement cloud final complètement terminé.
```

---

## 12. Prochaine évolution recommandée

La prochaine étape naturelle est le déploiement réel sur un environnement cloud gratuit ou à faible coût.

Option recommandée :

```text
Oracle Cloud Free Tier + VM Ubuntu + k3s Kubernetes
```

Architecture cible :

```text
GitHub Actions
  -> GHCR
  -> Oracle VM
  -> k3s Kubernetes
  -> ISGAARTI Store
  -> HTTPS avec Let’s Encrypt
```

Cette évolution permettrait de passer de :

```text
cloud-ready
```

à :

```text
cloud-hosted
```

---

## 13. Conclusion

La partie DevOps du projet ISGAARTI Store met en place une base sérieuse et professionnelle pour la production.

Le projet dispose maintenant :

- d’une configuration sécurisée par variables d’environnement ;
- d’une dockerisation frontend/backend ;
- d’un lancement complet avec Docker Compose ;
- d’un déploiement Kubernetes local ;
- d’une séparation des environnements avec Kustomize ;
- d’un pipeline CI automatisé ;
- d’une publication des images Docker sur GitHub Container Registry ;
- d’une structure prête pour un futur déploiement cloud.

Cette démarche montre que l’application a été pensée non seulement comme une application fonctionnelle, mais aussi comme un produit logiciel prêt à évoluer vers une exploitation réelle.

Formulation finale recommandée pour le rapport :

```text
ISGAARTI Store est une application ecommerce cloud-ready, containerisée avec Docker, orchestrable avec Kubernetes, validée automatiquement par GitHub Actions et prête à être déployée sur un environnement cloud via des images publiées dans GitHub Container Registry.
```
