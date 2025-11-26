import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [sveltekit()],
	server: {
    proxy: {
      // Proxy Cloudflare beacon (match your exact URL pattern)
      '^/cloudflare-beacon/(.*)\\.js': {
        target: 'https://static.cloudflareinsights.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
