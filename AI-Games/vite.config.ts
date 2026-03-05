import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { Plugin } from 'vite'

/**
 * Vite plugin to resolve Figma-exported asset imports.
 * Figma Make exports images as `figma:asset/<hash>.png` which is
 * Figma-specific and not understood by standard bundlers.
 * This plugin intercepts those imports and returns a transparent
 * placeholder SVG so the app renders without broken image errors.
 * Replace placeholders with real assets by placing PNGs in public/assets/
 * and updating the asset map below.
 */
function figmaAssetPlugin(): Plugin {
  const PREFIX = 'figma:asset/'

  // Map of Figma asset hashes to public asset paths.
  // Add real images to public/assets/ and list them here to replace placeholders.
  const assetMap: Record<string, string> = {
    // 'b7c663aaaffd2123e1f119dd74e53b5eadefff3c': '/assets/coke-logo.png',
    // '50df961786c08f3ce7403ef57839bc891028f51a': '/assets/hero.png',
    // '0b77b80337e00e3daf4cb457032e58b6d56f04a0': '/assets/content.png',
    // 'ff9936f7e451a179b1ac9cb210a5bceda3311140': '/assets/desk.png',
    // '1d8eef4f0b971ebad3c5ec87490f803b5217cbb0': '/assets/timer.png',
    // 'dcb115b258b620033204da77a8a40088d031186f': '/assets/stack.png',
    // '07dfe6c7775cacff76b9e7dffe5d04e7714eeb57': '/assets/hellen-icon.png',
    // '56b56d388664a39ac1bdfc334b9e0794a6db2ba8': '/assets/hellen-logo.png',
  }

  // Transparent 1x1 PNG placeholder as data URI
  const PLACEHOLDER =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
        <rect width="200" height="80" fill="#f1f5f9" rx="8"/>
        <text x="100" y="45" font-family="sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">Image</text>
      </svg>`
    )

  return {
    name: 'vite-plugin-figma-assets',
    resolveId(id: string) {
      if (id.startsWith(PREFIX)) {
        return '\0' + id
      }
    },
    load(id: string) {
      if (id.startsWith('\0' + PREFIX)) {
        const hash = id.replace('\0' + PREFIX, '').replace('.png', '')
        const mapped = assetMap[hash]
        const src = mapped ?? PLACEHOLDER
        return `export default ${JSON.stringify(src)}`
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'AI Adventure'),
    },
  },
  css: {
    // Vite processes the CSS imports; Tailwind v4 handles the rest
  },
})
