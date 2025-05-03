# Kleis Project

A modern web application with an Astro frontend and a containerized backend.

## 🚀 Project Overview

This project consists of a frontend built with Astro (using React islands) and a backend API, both containerized with Docker and orchestrated with Docker Compose.

### Key Technologies

#### Frontend
- **Astro** - Static-site generator with islands architecture
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Radix UI-based accessible components
- **React 18** - Used only within islands (client:visible)
- **TypeScript** - For type-safe code
- **Vanilla JS islands** - For lightweight DOM updates
- **Vite** - For fast builds and code splitting
- **Caddy** - Modern web server with automatic HTTPS

#### Backend
- Backend service (separate repository)
- REST API endpoints exposed at `/api/*`

#### Infrastructure
- **Docker** - For containerization
- **Docker Compose** - For orchestration
- **Caddy** - Web server with automatic HTTPS

## 📁 Project Structure

```
project-root/
├── frontend/               # Frontend application (Astro + React islands)
│   ├── src/                # Source code
│   │   ├── components/     # UI components
│   │   │   ├── ui/         # shadcn/ui components
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Astro pages
│   │   ├── styles/         # Global styles
│   │   └── lib/            # Utilities and helpers
│   ├── public/             # Static assets
│   ├── Dockerfile          # Frontend Docker configuration
│   ├── Caddyfile           # Caddy server configuration
│   └── ... (config files)  # Various configuration files
├── backend/                # Backend application
├── docker/                 # Docker configuration files
├── docker-compose.yml      # Main Docker Compose configuration
└── ... (other files)       # Other project files
```

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Setup and Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/kleis.git
cd kleis
```

2. **Frontend Development Setup**

```bash
cd frontend
npm install
npm run dev
```

3. **Run with Docker Compose**

```bash
# From the project root
docker compose up -d
```

## 🧑‍💻 Development Workflow

### Frontend Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Docker Commands

```bash
# Start all services
docker compose up -d

# Rebuild and start services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

## 🔧 Frontend Configuration

### Astro Configuration

The Astro configuration is defined in `frontend/astro.config.mjs`. It includes:

- Integration with React for islands
- Integration with Tailwind CSS
- TypeScript strict mode enabled
- Static output generation

### Tailwind CSS

Tailwind is configured in `frontend/tailwind.config.js`. It includes:

- Custom color scheme using HSL variables
- Integration with shadcn/ui components
- JIT mode with content purging

### TypeScript

TypeScript is configured in `frontend/tsconfig.json`. It includes:

- Strict type checking
- Path aliases for imports
- React JSX support

## 🚢 Deployment

### Docker Deployment

The frontend is deployed using a multi-stage Docker build:

1. Build stage uses Node.js to build the Astro application
2. Production stage uses Caddy to serve the static files
3. Caddy handles SSL/TLS termination and proxies API requests to the backend

### Caddy Configuration

The Caddy server is configured in `frontend/Caddyfile`. It handles:

- Serving static files from the Astro build
- Proxying API requests to the backend
- Automatic HTTPS certificate provisioning
- Security headers

## 🧩 Key Components

### LivePriceUpdater

A vanilla JS custom element that:
- Fetches real-time price and stock information
- Updates the DOM without full page hydration
- Uses efficient DOM patching for performance

### shadcn/ui Components

The project uses shadcn/ui components like:
- Button - For interactive elements
- Toast - For notifications

## 🚧 Development Guidelines

### Code Style

- Follow the ESLint and Prettier configurations
- Use TypeScript for all new code
- Follow the shadcn/ui component patterns

### Performance

- Keep React islands minimal
- Prefer static HTML when possible
- Use client:visible directive for islands that need interactivity
- Leverage Astro's partial hydration model

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit your changes: `git commit -m 'Add some amazing feature'`
3. Push to the branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.