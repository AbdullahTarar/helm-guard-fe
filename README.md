
# HelmGuard Frontend

## 🛡️ Overview

**HelmGuard Frontend** is the user-facing web interface for [HelmGuard](https://github.com/AbdullahTarar/helm-guard), a tool that scans Helm charts for:
- **Security vulnerabilities**
- **Predicted Kubernetes resources**
- **Best practice compliance**

This frontend is built with **Next.js** and provides a seamless UI for GitHub OAuth login, uploading charts, and viewing detailed scan results.

## 📑 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Features

- GitHub authentication via OAuth
- Upload and scan public or private Helm charts
- View detailed scan results:
  - Vulnerabilities
  - Best practice checks
  - Created Kubernetes resources
- Responsive and user-friendly Next.js UI

## 🧰 Installation

### Requirements

- [Node.js 18+](https://nodejs.org/)
- npm or yarn

### Clone the Repo

```bash
git clone https://github.com/AbdullahTarar/helm-guard-frontend.git
cd helm-guard-frontend
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

## 🧪 Usage

To run the app locally:

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:3000`.

Make sure your backend (`helm-guard-be`) is running and accessible.

## 🔐 Environment Variables

Create a `.env` file in the root directory and add the following:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

Make sure to replace with actual credentials and backend URL.

## 🔗 API Integration

The frontend connects to the following backend endpoints:

- `POST /api/scan/public` — Trigger scan for public charts
- `POST /api/scan/private` — Trigger scan for private GitHub charts
- `GET /api/scan/results/{id}` — Fetch scan results
- `GET /api/github/auth` — Start GitHub OAuth
- `GET /api/github/callback` — OAuth callback
- `GET /api/github/repos` — List user repositories
- `GET /api/auth/status` — Auth status

These are called internally via the frontend’s services or context.

## 👨‍💻 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
