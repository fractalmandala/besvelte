import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function geckoboxBackend(): Plugin {
  let backendServer: { url: string; token: string; close: () => Promise<void> } | undefined;
  let devToken = '';

  const serverDistPath = fileURLToPath(new URL('../dist/server/server.js', import.meta.url));

  async function checkBackendAlive(): Promise<boolean> {
    try {
      const ping = await fetch('http://127.0.0.1:4600/api/health', { signal: AbortSignal.timeout(500) });
      return ping.status === 200 || ping.status === 401;
    } catch {
      return false;
    }
  }

  async function ensureBackendStarted(): Promise<string> {
    if (await checkBackendAlive()) {
      return devToken;
    }

    if (!existsSync(serverDistPath)) {
      const { execSync } = await import('node:child_process');
      console.log('\n[geckobox] Building backend TypeScript for dev...');
      execSync('npm run build:backend', { cwd: fileURLToPath(new URL('../', import.meta.url)), stdio: 'inherit' });
    }

    try {
      const { startServer } = await import(serverDistPath);
      backendServer = await startServer({ port: 4600 });
      devToken = backendServer.token;
      console.log(`\n[geckobox] Backend server active on ${backendServer.url} (port 4600)`);
    } catch (e: any) {
      if (e?.code === 'EADDRINUSE') {
        console.log('\n[geckobox] Port 4600 in use; connected to existing backend.');
      } else {
        console.error('\n[geckobox] Failed to start backend:', e);
      }
    }
    return devToken;
  }

  return {
    name: 'geckobox-backend',
    async configureServer(server) {
      await ensureBackendStarted();

      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/dev-token') {
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ token: devToken }));
          return;
        }

        // Auto-heal if backend connection was lost
        if (req.url?.startsWith('/api/')) {
          if (!(await checkBackendAlive())) {
            await ensureBackendStarted();
          }
        }

        next();
      });

      const origPrint = server.printUrls;
      let windowLaunched = false;
      server.printUrls = async () => {
        origPrint();
        const appUrl = `http://localhost:5174/#token=${devToken}`;
        if (devToken) {
          console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mAuth link\x1b[0m: \x1b[36m${appUrl}\x1b[0m\n`);
        }

        if (!windowLaunched && process.env.NO_DESKTOP !== '1') {
          windowLaunched = true;
          const desktopBin = fileURLToPath(new URL('../scripts/desktop-window', import.meta.url));
          const desktopSwift = fileURLToPath(new URL('../scripts/desktop.swift', import.meta.url));

          if (!existsSync(desktopBin) && existsSync(desktopSwift)) {
            const { execSync } = await import('node:child_process');
            try {
              execSync(`swiftc -O -framework Cocoa -framework WebKit "${desktopSwift}" -o "${desktopBin}"`, { stdio: 'ignore' });
            } catch {}
          }

          if (existsSync(desktopBin)) {
            console.log('  \x1b[32m➜\x1b[0m  \x1b[1mLaunching Desktop Window...\x1b[0m\n');
            const { spawn } = await import('node:child_process');
            const child = spawn(desktopBin, [appUrl], { stdio: 'ignore', detached: true });
            child.unref();
          }
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
  plugins: [
    geckoboxBackend(),
    sveltekit(),
    tailwindcss(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      emitTsDeclarations: true
    })
  ],
  server: { port: 5174, proxy: { '/api': 'http://127.0.0.1:4600' } }
});
