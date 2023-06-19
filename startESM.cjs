console.log('gianni');
import loadEnv from './loadEnv.js';
import { createServer } from 'vite';
import config from './vite.config.js';

import { spawn } from 'child_process';

const server = await createServer();

const scriptName = 'dev';

const child = spawn('npm', ['run', scriptName], {
	stdio: 'inherit',
	shell: true,
	env: loadEnv
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
	const server = await createServer(config);

	await server.listen();

	console.log('Vite è in esecuzione!');
}

runVite().catch((error) => {
	console.error("Errore durante l'avvio di Vite:", error);
});
