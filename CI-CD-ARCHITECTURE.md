# CI/CD Architecture - Visual Overview

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                   CUENTAS CLARAS - CI/CD SYSTEM                     │
└─────────────────────────────────────────────────────────────────────┘

                            ┌──────────────────┐
                            │   Your Code      │
                            │  (ccbackend/     │
                            │   ccfrontend/)   │
                            └────────┬─────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
                ▼                    ▼                    ▼
        ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
        │  Git Commit  │      │  Manual Cmd  │      │GitHub Actions│
        └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
               │                     │                     │
               └─────────────────────┼─────────────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │   CI/CD Pipeline       │
                        │  (lint, test, build)   │
                        └────────────┬────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
              ✅ Passed?         Tests Ok?      Build Ok?
                    │                │                │
          All Pass: │                │                │
          ┌─────────┴────────┬───────┴────────────────┘
          │                  │
          ▼                  ▼
    ┌──────────────┐   ┌──────────────┐
    │   Export     │   │   Artifact   │
    │  Artifacts   │   │  (GitHub)    │
    └──────┬───────┘   └──────┬───────┘
           │                  │
           ▼                  ▼
    ┌──────────────────┐ ┌──────────────────┐
    │ ci-cd-outputs/   │ │ GitHub Artifacts │
    │ ├─ front_ok/     │ │ (30 days)        │
    │ └─ back_ok/      │ │                  │
    └──────┬───────────┘ └──────┬───────────┘
           │                    │
           └────────┬───────────┘
                    │
                    ▼
          ┌──────────────────────┐
          │  Ready for Deploy 🚀 │
          │                      │
          │ Docker / Server /    │
          │ Cloud Platform       │
          └──────────────────────┘
```

---

## 🔄 Local CI/CD Flow

```
START
  │
  ├─ Validate Environment
  │    └─ Check directories exist
  │
  ├─ BACKEND PIPELINE
  │    ├─ Lint (ESLint)
  │    │   └─ Pass? ─┐
  │    │             ├─ No  → FAIL ✗
  │    │             └─ Yes ▼
  │    ├─ Tests (npm run test:health)
  │    │   └─ Pass? ─┐
  │    │             ├─ No  → FAIL ✗
  │    │             └─ Yes ▼
  │    ├─ Build (npm install)
  │    │   └─ Pass? ─┐
  │    │             ├─ No  → FAIL ✗
  │    │             └─ Yes ▼
  │    └─ Export to back_ok/
  │        └─ Create MANIFEST.json
  │        └─ Create latest/ symlink
  │
  ├─ FRONTEND PIPELINE
  │    ├─ Lint (ESLint)
  │    │   └─ Pass? ─┐
  │    │             ├─ No  → FAIL ✗
  │    │             └─ Yes ▼
  │    ├─ Type Check (TypeScript)
  │    │   └─ Pass? ─┐
  │    │             ├─ No  → FAIL ✗
  │    │             └─ Yes ▼
  │    ├─ Tests (Jest)
  │    │   └─ Pass? ─┐
  │    │             ├─ No  → FAIL ✗
  │    │             └─ Yes ▼
  │    ├─ Build (Next.js)
  │    │   └─ Pass? ─┐
  │    │             ├─ No  → FAIL ✗
  │    │             └─ Yes ▼
  │    └─ Export to front_ok/
  │        └─ Create MANIFEST.json
  │        └─ Create latest/ symlink
  │
  └─ SUCCESS ✓
       │
       ▼
  Artifacts Ready
  ├─ ci-cd-outputs/front_ok/frontend_2025-10-29_14-30-00/
  ├─ ci-cd-outputs/back_ok/backend_2025-10-29_14-30-00/
  └─ Latest accessible via latest/ symlink
```

---

## 📁 Output Structure Detailed

```
ci-cd-outputs/
│
├── front_ok/
│   ├── latest -> frontend_2025-10-29_14-30-00/
│   │   (symlink to most recent build)
│   │
│   ├── frontend_2025-10-29_14-30-00/
│   │   ├── .next/
│   │   │   ├── standalone/          ← Compiled Next.js app
│   │   │   ├── static/              ← CSS, JS bundles
│   │   │   ├── server/              ← Server functions
│   │   │   └── package.json
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   └── assets/
│   │   ├── package.json             ← Dependencies list
│   │   ├── package-lock.json
│   │   ├── next.config.js           ← Next.js config
│   │   ├── .env.example             ← Copy to .env
│   │   ├── Dockerfile               ← For docker deploy
│   │   ├── README.md
│   │   └── MANIFEST.json            ← Metadata
│   │       {
│   │         "exportedAt": "2025-10-29T14:30:00Z",
│   │         "type": "frontend",
│   │         "version": "1.0.0",
│   │         "buildStatus": "success"
│   │       }
│   │
│   ├── frontend_2025-10-29_12-00-00/
│   └── frontend_2025-10-28_15-45-30/
│       (older builds, keep for fallback)
│
└── back_ok/
    ├── latest -> backend_2025-10-29_14-30-00/
    │
    ├── backend_2025-10-29_14-30-00/
    │   ├── src/
    │   │   ├── index.js              ← App entry point
    │   │   ├── db.js
    │   │   ├── logger.js
    │   │   ├── sequelize.js
    │   │   ├── swagger.js
    │   │   ├── routes/               ← 35+ API routes
    │   │   ├── services/
    │   │   └── middleware/
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── .env.example
    │   ├── Dockerfile
    │   ├── README.md
    │   └── MANIFEST.json
    │
    └── backend_2025-10-29_12-00-00/
        (older builds)
```

---

## 🌐 GitHub Actions Flow

```
Developer Push
    │
    ▼
GitHub Webhook
    │
    └─→ Trigger: push to main/develop/conexiones-backend-frontend
        │
        ├─ BACKEND-CI Job (Ubuntu)
        │  ├─ Checkout code
        │  ├─ Setup Node.js 18
        │  ├─ npm install
        │  ├─ npm run lint
        │  └─ npm run test:health
        │
        ├─ FRONTEND-CI Job (Ubuntu)
        │  ├─ Checkout code
        │  ├─ Setup Node.js 18
        │  ├─ npm install
        │  ├─ npm run lint
        │  ├─ npm run type-check
        │  ├─ npm run test:ci
        │  └─ npm run build
        │
        ├─ SECURITY-SCAN Job
        │  ├─ npm audit backend
        │  └─ npm audit frontend
        │
        └─ EXPORT-BUILD Job (Only on successful push)
           ├─ Export backend artifacts
           ├─ Export frontend artifacts
           └─ Upload to GitHub (30 days retention)
               │
               ▼
            GitHub Artifacts
            ├─ backend-build-123
            ├─ frontend-build-123
            └─ build-manifest-123
```

---

## 📊 Command Comparison

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMMAND EXECUTION PATHS                          │
└─────────────────────────────────────────────────────────────────────┘

node ci-cd-local.js
  │
  ├─→ Load: ci-cd-local.js
  ├─→ Validate: Environment
  ├─→ Run: Backend Pipeline
  ├─→ Run: Frontend Pipeline
  ├─→ Export: Artifacts
  └─→ Output: ci-cd-outputs/

node ci-cd-local.js --front
  │
  ├─→ Load: ci-cd-local.js
  ├─→ Skip: Backend Pipeline
  ├─→ Run: Frontend Pipeline only
  ├─→ Export: Front artifacts only
  └─→ Output: ci-cd-outputs/front_ok/

node ci-cd-local.js --back
  │
  ├─→ Load: ci-cd-local.js
  ├─→ Run: Backend Pipeline only
  ├─→ Skip: Frontend Pipeline
  ├─→ Export: Back artifacts only
  └─→ Output: ci-cd-outputs/back_ok/

node ci-cd-local.js --watch
  │
  ├─→ Load: ci-cd-local.js
  ├─→ Initialize: Chokidar file watcher
  ├─→ Monitor: ccbackend/ & ccfrontend/
  ├─→ On Change: Re-run pipelines
  └─→ Continue: Until Ctrl+C

ci-cd-local.bat (Windows GUI)
  │
  ├─→ Show Menu
  ├─→ Option 1 → node ci-cd-local.js
  ├─→ Option 2 → node ci-cd-local.js --front
  ├─→ Option 3 → node ci-cd-local.js --back
  ├─→ Option 4 → node ci-cd-local.js --watch
  ├─→ Option 5 → Clean old builds
  ├─→ Option 6 → List builds
  ├─→ Option 7 → Setup (npm install)
  └─→ Option 0 → Exit
```

---

## 🚀 Deploy Workflow

```
┌──────────────────────────────────────────────────────────────┐
│              FROM CI/CD TO PRODUCTION                        │
└──────────────────────────────────────────────────────────────┘

Local CI/CD Output
│
├─ ci-cd-outputs/front_ok/latest/
│  ├─ .next/        ← Ready for deployment
│  ├─ public/
│  ├─ Dockerfile
│  └─ MANIFEST.json
│
└─ ci-cd-outputs/back_ok/latest/
   ├─ src/          ← Ready for deployment
   ├─ Dockerfile
   └─ MANIFEST.json

           │
           ▼
    ┌─────────────────────────────────────┐
    │  OPTION A: Docker Deploy            │
    ├─────────────────────────────────────┤
    │ cd ci-cd-outputs/front_ok/latest/   │
    │ docker build -t myapp:latest .      │
    │ docker push registry/myapp:latest   │
    │ docker run -p 3000:3000 myapp       │
    └─────────────────────────────────────┘

           │
           ▼
    ┌─────────────────────────────────────┐
    │  OPTION B: Direct Deploy            │
    ├─────────────────────────────────────┤
    │ scp -r ci-cd-outputs/front_ok/      │
    │   latest/ user@server:/app/         │
    │ ssh user@server                     │
    │ cd /app/latest                      │
    │ npm ci && npm start                 │
    └─────────────────────────────────────┘

           │
           ▼
    ┌─────────────────────────────────────┐
    │  OPTION C: S3/Cloud Storage         │
    ├─────────────────────────────────────┤
    │ aws s3 cp ci-cd-outputs/ \          │
    │   s3://mybucket/builds/ --recursive │
    │ CloudFormation / Terraform deploy   │
    └─────────────────────────────────────┘

           │
           ▼
    ┌─────────────────────────────────────┐
    │   🎉 DEPLOYED                       │
    │   App Running in Production         │
    └─────────────────────────────────────┘
```

---

## 📈 Timeline - Typical Build

```
START
  │
  ├─ 0:00   Validate environment
  │
  ├─ BACKEND
  │  ├─ 0:05 Lint backend (5 sec)
  │  ├─ 0:15 Tests backend (10 sec)
  │  ├─ 0:25 Build backend (10 sec)
  │  └─ 0:30 Export backend (5 sec)
  │
  ├─ FRONTEND
  │  ├─ 0:35 Lint frontend (5 sec)
  │  ├─ 0:40 Type check (5 sec)
  │  ├─ 0:50 Tests frontend (10 sec)
  │  ├─ 2:30 Build frontend (100 sec)
  │  └─ 2:40 Export frontend (10 sec)
  │
  └─ 2:45 COMPLETE ✓
```

**First build**: ~2-3 min (npm install)  
**Subsequent**: ~30-45 sec (cached)  
**Watch mode**: ~5-10 sec per change

---

## 🔐 Security Flow

```
Source Code
    │
    ├─ ESLint
    │  └─ Check: Code quality, unused vars, patterns
    │
    ├─ TypeScript
    │  └─ Check: Type safety, null checks
    │
    ├─ Jest
    │  └─ Check: Functional correctness
    │
    ├─ npm audit
    │  └─ Check: Dependency vulnerabilities
    │
    └─ Output Validation
       └─ Check: Artifacts generated successfully
           │
           └─→ All pass? ✓ → Ready for deployment
               All pass? ✗ → Stop, fix issues, retry
```

---

## 💾 Storage & Retention

```
Local Storage (ci-cd-outputs/)
├─ Keep indefinitely (unlimited space)
├─ Manual cleanup recommended (>30 days)
└─ Perfect for local backup

GitHub Artifacts
├─ Automatic retention: 30 days
├─ Limit: 400 artifacts per repo
├─ Size: Up to 5GB per artifact
└─ Auto-cleanup: Oldest deleted when full

Recommendation:
├─ Keep local: Last 7 days
├─ Archive old: S3 / LFS
└─ GitHub: Free storage for team access
```

---

## 🔄 Development Workflow Integration

```
Day 1: Setup
  │
  ├─ npm install --save-dev chalk chokidar
  └─ node ci-cd-local.js --watch
     (keep terminal open)

Day 2-N: Development
  │
  ├─ Edit code in IDE
  └─ Watch mode auto-recompiles
     ├─ Tests run
     ├─ Linting checks
     ├─ Builds generate
     └─ Outputs ready for testing

Pre-Commit:
  │
  ├─ Stop watch (Ctrl+C)
  ├─ Run final validation
  └─ node ci-cd-local.js --front
     node ci-cd-local.js --back

Push to GitHub:
  │
  ├─ GitHub Actions auto-runs
  ├─ Same checks as local
  └─ Artifacts generated

Merge PR → Deploy
  │
  └─ Download artifact or use local build
     ├─ Docker deploy
     ├─ Direct deploy
     └─ Cloud deploy
```

---

**Visual Guide Completed** ✓  
Reference this when explaining to team members.
