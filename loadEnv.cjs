const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = function loadEnv() {
	let argv = minimist(process.argv.slice(2), { '--': true });
	let customEnvVariables = {};
	if (typeof argv.env === 'string') {
		const [key, value] = argv.env.split('=');
		customEnvVariables[key] = value;
	} else if (Array.isArray(argv.env)) {
		argv.env.forEach((item) => {
			const [key, value] = item.split('=');
			customEnvVariables[key] = value;
		});
	}

	const cliArgv = { ...argv, ...customEnvVariables };

	// now load into the process the variables that you want and also making checks

	let cli_customer = cliArgv['customer'];
	let customer = require(path.resolve('customerSelection.cjs'));
	if (cli_customer != undefined) {
		customer = cli_customer;
	}

	const customersFolders = fs
		.readdirSync(path.resolve('customers'), { withFileTypes: true })
		.filter((file) => file.isDirectory())
		.map((file) => file.name);

	// CHECK VARIABLES
	// default no undefined for custom variables passed
	Object.keys(customEnvVariables).forEach((key) => {
		if (customEnvVariables[key] == undefined) {
			console.log(
				chalk.red(
					`no undefined custom cli variables. Variable '${key}' is undefined.`
				)
			);
			process.exit(0);
		}
	});

	// i expect a variable called configjson to be passed in the line arguments.
	if (cliArgv.configjson == undefined) {
		console.log(
			chalk.red(
				"Node Variable 'configjson' is required. This variable determine the config json file that will be loaded. Possible values: \n-local\n-dev\n-test\n-prod"
			)
		);
		process.exit(0);
	}

	if (customer != '') {
		if (!customersFolders.includes(customer) && customer != undefined) {
			console.log(
				chalk.red(`The specified customer ${customer} doesn't exist!`)
			);
			process.exit(0);
		}
	}

	if (customer != '') {
		if (
			!fs.existsSync(
				path.resolve(
					`customers/${customer}/env/${cliArgv.configjson}.json`
				)
			)
		) {
			console.log(
				chalk.red(
					`The specified configjson file '${cliArgv.configjson}' doesn't exist for customer '${customer}'!`
				)
			);
			process.exit(0);
		}
	} else {
		if (!fs.existsSync(path.resolve(`env/${cliArgv.configjson}.json`))) {
			console.log(
				chalk.red(
					`The specified configjson file '${cliArgv.configjson}' doesn't exist in the standard env folder!`
				)
			);
			process.exit(0);
		}
	}

	// save the variables in the node process to acces everywhere during compilation. Note that variables here are string only.
	let noparse = ['env', '_', '--'];
	Object.keys(cliArgv).forEach((propertyname) => {
		if (!noparse.includes(propertyname)) {
			if (propertyname in process.env) {
				console.log(
					chalk.red(
						`Attention: the variable '${propertyname}' already exist in process.env. Please choose another name.`
					)
				);
				process.exit(0);
			}
			process.env[propertyname] = cliArgv[propertyname];
		}
	});
	process.env.customer = customer;

	if (cliArgv.mode) {
		const defaultNodeEnv =
			cliArgv.mode === 'production' || cliArgv.mode === 'test'
				? cliArgv.mode
				: 'development';
		if (process.env.NODE_ENV == null) {
			process.env.NODE_ENV = defaultNodeEnv;
		}
		if (process.env.BABEL_ENV == null) {
			process.env.BABEL_ENV = defaultNodeEnv;
		}
	}

	console.log(
		`CUSTOMER:    ${
			customer == ''
				? '[none]'
				: chalk.cyan.bold(customer.toUpperCase()) + cli_customer ==
				  undefined
				? '(loaded from customerSelection file)'
				: '(loaded from node env variable)'
		}`
	);
	console.log(
		`CONFIG JSON: ${chalk.cyan.bold(cliArgv.configjson + '.json')}`
	);
	console.log(
		`NODE ENV:    ${chalk.cyan.bold(process.env.NODE_ENV.toUpperCase())}`
	);
	console.log(
		`BABEL ENV:   ${chalk.cyan.bold(process.env.BABEL_ENV.toUpperCase())}\n`
	);
};
