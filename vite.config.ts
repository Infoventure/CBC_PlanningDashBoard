import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/CBC_PlanningDashBoard/',  // ← required for GitHub Pages
  plugins: [react()],
})
