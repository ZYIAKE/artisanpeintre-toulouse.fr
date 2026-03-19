import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync } from 'fs'

// Auto-discover all HTML files (root + villes/)
function getHtmlInputs() {
  const inputs = {}

  // Root HTML files (exclude ville.html template)
  const excludeFiles = ['ville.html', 'chantier.html']
  const rootFiles = readdirSync(resolve(__dirname)).filter(f => f.endsWith('.html') && !excludeFiles.includes(f))
  rootFiles.forEach(f => {
    const name = f.replace('.html', '')
    inputs[name] = resolve(__dirname, f)
  })

  // Villes HTML files
  try {
    const villeFiles = readdirSync(resolve(__dirname, 'villes')).filter(f => f.endsWith('.html'))
    villeFiles.forEach(f => {
      const name = 'villes/' + f.replace('.html', '')
      inputs[name] = resolve(__dirname, 'villes', f)
    })
  } catch (e) {
    // No villes directory yet, that's ok
  }

  return inputs
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: getHtmlInputs()
    },
    // Minify HTML, CSS, JS
    minify: 'terser',
    cssMinify: true
  },
  server: {
    port: parseInt(process.env.PORT) || 3000,
    open: false
  }
})
