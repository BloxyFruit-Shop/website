import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			"$icons": "./src/lib/icons",
			"$components": "./src/lib/components",
			"$elements": "./src/lib/elements",
			"$server/mongo": "./src/aserver/mongo.server.js",
			"$server/schemes": "./src/aserver/schemes.server.js",
			"$server/api": "./src/aserver/api.server.js",
			"$server/cache": "./src/aserver/cache.server.js",
			"$server/utils": "./src/aserver/utils.server.js",
			"$server/emails": "./src/aserver/emails"
		}
	},
	preprocess: vitePreprocess()
}

export default config