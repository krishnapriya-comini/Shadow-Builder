import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const isStandalone = process.env.BUILD_MODE === 'standalone';
const isMFE = process.env.BUILD_MODE === 'mfe';
const mfeName = 'shadow-builder-mfe';
const port = 9007;

const outputPath = isStandalone ? 'dist' : 'dist-mfe';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        base: isMFE ? '/' : '/',
        server: {
            port,
            host: '0.0.0.0',
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            }
        },
        plugins: [
            react(),
            tailwindcss(),
            ...(isMFE ? [cssInjectedByJsPlugin({
                styleId: 'shadow-builder-mfe-styles',
            })] : [])
        ],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            ...(isMFE ? { 'process.env': JSON.stringify({}) } : {})
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        build: {
            target: 'esnext',
            ...(isMFE
                ? {
                    outDir: outputPath,
                    // Copy public/ (assets, sounds, animations) into dist-mfe so the
                    // host CDN serves them under assetBase. Replaces the old `cp -r`.
                    copyPublicDir: true,
                    lib: {
                        entry: path.resolve(__dirname, 'mfe-entry.tsx'),
                        name: mfeName,
                        formats: ['es'],
                        fileName: () => 'main.js'
                    },
                    cssCodeSplit: false,
                    rollupOptions: {
                        output: {
                            format: 'es',
                            entryFileNames: 'main.js',
                            assetFileNames: 'assets/[name].[ext]'
                        }
                    }
                }
                : {
                    outDir: 'dist',
                    rollupOptions: {
                        input: './index.html',
                    }
                }
            )
        },
        preview: {
            port,
            cors: true
        }
    };
});
