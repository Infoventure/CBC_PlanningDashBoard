import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isDev = 'dev';

// https://vitejs.dev/config/
export default defineConfig({
  base: isDev
    ? '/CBC_PlanningDashBoard-dev/'
    : '/CBC_PlanningDashBoard/',
})
