import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function geckoboxBackend(): Plugin {
  let backendServer: { url: string; token: string; close: () => Promise<void> } | undefined;
  let devToken = '';

  return {
    name: 'geckobox-backend',
    async configureServer(server) {
      const serverDistPath = fileURLToPath(new URL('../dist/server/server.js', import.meta.url));
      if (!existsSync(serverDistPath)) {
        const { execSync } = await import('node:child_process');
        console.log('\n[geckobox] Building backend TypeScript for dev...');
        execSync('npm run build:backend', { cwd: fileURLToPath(new URL('../', import.meta.url)), stdio: 'inherit' });
      }

      // Check if backend is already running on 4600
      let alreadyRunning = false;
      try {
        const ping = await fetch('http://127.0.0.1:4600/api/health', { signal: AbortSignal.timeout(600) });
        if (ping.status === 200 || ping.status === 401) {
          alreadyRunning = true;
        }
      } catch {}

      if (alreadyRunning) {
        console.log('\n[geckobox] Connected to running backend on http://127.0.0.1:4600');
      } else {
        const { startServer } = await import(serverDistPath);
        backendServer = await startServer({ port: 4600 });
        devToken = backendServer.token;
        console.log(`\n[geckobox] Backend server active on ${backendServer.url}`);
      }

      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/dev-token') {
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ token: devToken }));
          return;
        }
        next();
      });

      const origPrint = server.printUrls;
      server.printUrls = () => {
        origPrint();
        if (devToken) {
          console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mAuth link\x1b[0m: \x1b[36mhttp://localhost:5174/#token=${devToken}\x1b[0m\n`);
        }
      };

      server.httpServer?.on('close', async () => {
        if (backendServer) {
          await backendServer.close();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [geckoboxBackend(), sveltekit(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://127.0.0.1:4600'
    }
  }
});
