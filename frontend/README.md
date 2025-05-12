# Kleis Frontend

The frontend for the Kleis project, built with Astro, React islands, and Tailwind CSS.

## 🚀 Technologies

- **Astro** - Static-site generator with built-in islands
- **Tailwind CSS** - Utility-first styling (JIT + purge)
- **shadcn/ui (Radix-based)** - React components for drawers, modals, toasts
- **React 18** - Only inside islands (client:visible)
- **TypeScript** - For all components and utilities
- **Vanilla JS island (live.js)** - For lightweight DOM updates
- **ESLint + Prettier** - For code linting and formatting
- **PostCSS / Autoprefixer** - Via Tailwind's pipeline
- **Vite** - For building and code-splitting assets
- **modern-normalize.css** - For baseline browser reset

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/                # Source code
│   ├── components/     # UI components
│   │   ├── ui/         # shadcn/ui components
│   │   └── ...         # Custom components
│   ├── layouts/        # Page layouts
│   ├── pages/          # Astro pages
│   ├── styles/         # Global styles
│   └── lib/            # Utilities and helpers
├── public/             # Static assets
├── Dockerfile          # Docker configuration
├── Caddyfile           # Caddy server configuration
└── ... (config files)  # Various configuration files
```

## 🧩 Components

### shadcn/ui Components

We use shadcn/ui components, which are built on Radix UI primitives. These provide accessible, customizable UI elements.

Example usage:

```tsx
import { Button } from '@/components/ui/button';

export default function MyComponent() {
  return (
    <Button variant="default">
      Click me
    </Button>
  );
}
```

### LivePriceUpdater

A vanilla JS custom element for efficient DOM updates without full hydration:

```html
<live-price-updater data-product-id="123"></live-price-updater>
```

## 🔄 Astro Islands

The project uses Astro's partial hydration model. Components can be hydrated with directives:

```jsx
// Only hydrate when component is visible
<ProductCard client:visible />

// Never hydrate (static HTML)
<StaticInfo />
```

## 🎨 Styling

Styling is done primarily through Tailwind CSS utilities:

```html
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <!-- Content -->
</div>
```

Global styles and CSS variables are defined in `src/styles/globals.css`.

## 📦 Docker Deployment

The frontend is deployed using Docker:

```bash
# Build the Docker image
docker build -t kleis-frontend .

# Run the container
docker run -p 80:80 -p 443:443 kleis-frontend
```

The Dockerfile uses a multi-stage build process:
1. Build the Astro application with Node.js
2. Serve the static files with Caddy

## 🧪 Testing

Currently, the project doesn't have automated tests configured. This is an area for future improvement.

## 🧠 Best Practices

1. **Minimize JavaScript**
   - Use static HTML when possible
   - Keep React islands small and focused

2. **Performance**
   - Use `client:visible` for components that need interactivity
   - Leverage browser APIs when possible

3. **Accessibility**
   - Use shadcn/ui components for built-in accessibility
   - Test with keyboard navigation and screen readers

4. **TypeScript**
   - Define interfaces for props and data structures
   - Use strict type checking

## 🤝 Contributing

When adding new features:

1. Follow the existing code style
2. Add proper TypeScript types
3. Keep components small and focused
4. Prefer composition over inheritance
5. Document your code with comments

## Color scheme
- black #000000
- whites #FFFFFF
- grays ( #333333, #666666, #999999, #CCCCCC, etc.)
- primary (navy) #002855
- secondary (blue-grey) #364F6B
- accent (electric lime) #A4F600
- danger/error/alert (red) #FF4D4F