# AETERNA

**The Soul of Venice. Distilled.**

An ultra-luxury water brand landing page featuring award-worthy design, liquid animations, and Venetian heritage aesthetics.

![AETERNA](https://img.shields.io/badge/Venice-Est.%202026-D4AF37?style=flat-square&labelColor=020405)

---

## Design Philosophy

> "The Luxury of Subtraction"

Inspired by Steve Jobs' minimalism, this landing page embodies absolute purity through:
- **Void Black/Deep Teal** backgrounds (#020405)
- **Venetian Gold** accents (#D4AF37)
- **Liquid animations** that feel underwater
- **Glass morphism** effects mimicking Murano glass
- **Clinical typography** for data points

---

## Tech Stack

- **React 18** (Functional Components, Hooks)
- **Framer Motion** (Scroll-based animations, Parallax)
- **Tailwind CSS** (Utility-first styling)
- **Vite** (Build tooling)
- **Lucide React** (Minimal iconography)

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to the project directory
cd aeterna-landing

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
aeterna-landing/
├── public/
│   └── favicon.svg         # Brand favicon
├── src/
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles & Tailwind
├── index.html              # HTML template with fonts
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies
```

---

## Sections

1. **Hero** - Full-screen brand introduction with water droplet scroll indicator
2. **The Artifact** - Product showcase with floating bottle and data points
3. **The Heritage** - Abstract Venetian elements with brand philosophy
4. **The Acquisition** - Minimalist CTA and footer

---

## Customization

### Adding the Bottle Image

Replace the bottle placeholder in `App.jsx` within the `ArtifactSection` component:

```jsx
{/* Replace GlassPanel with your bottle image */}
<img 
  src="/path/to/bottle.png" 
  alt="AETERNA Bottle"
  className="w-64 md:w-80 h-auto object-contain"
/>
```

### Fonts

The project uses:
- **Playfair Display** - Serif headings
- **JetBrains Mono** - Technical/data text
- **Inter** - Body text

---

## License

© MMXXVI Aeterna S.r.l. All rights reserved.

*Venice, Italy. Est. 2026.*
