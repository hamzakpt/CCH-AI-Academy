/// <reference types="vite/client" />

// Figma Make exports images with a custom `figma:asset/` scheme.
// These are resolved at build time by the vite-plugin-figma-assets plugin.
declare module 'figma:asset/*.png' {
  const src: string
  export default src
}

declare module 'figma:asset/*.jpg' {
  const src: string
  export default src
}

declare module 'figma:asset/*.svg' {
  const src: string
  export default src
}

// CSS modules
declare module '*.css' {
  const content: string
  export default content
}
