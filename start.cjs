console.log('gianni');

const loadEnv = require('./loadEnv.cjs');
loadEnv();
const { createServer } = require('vite');

const { spawn } = require('child_process');

async function main() {
	const server = await createServer();

	const scriptName = 'dev';

	const child = spawn('npm', ['run', scriptName], {
		stdio: 'inherit',
		shell: true,
		env: loadEnv,
	});

	child.on('close', (code) => {
		if (code !== 0) {
			console.error(
				`The npm script '${scriptName}' exited with code ${code}`
			);
		}
		server.close();
	});

	async function runVite() {
		const configModule = await import('./vite.config.js');
		const config = configModule.default;

		const server = await createServer(config);

		await server.listen();

		console.log('Vite è in esecuzione!');
	}

	runVite().catch((error) => {
		console.error("Errore durante l'avvio di Vite:", error);
	});
}

main();
