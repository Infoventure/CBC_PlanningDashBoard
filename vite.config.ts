import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = '/CBC_PlanningDashBoard/';

// https://vitejs.dev/config/
export default defineConfig({
  base: base,
    plugins: [react()],
})
