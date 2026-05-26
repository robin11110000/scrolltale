import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const previewHost = process.env.LOCUS_PREVIEW_HOST;
const apiProxyTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:4000';

export default defineConfig({
	plugins: [react()],
	server: {
		host: '0.0.0.0',
		strictPort: true,
		allowedHosts: 'all',
		proxy: {
			'/api': apiProxyTarget,
		},
		hmr: previewHost
			? {
					host: previewHost,
					clientPort: 443,
					protocol: 'wss',
				}
			: undefined,
	},
});
