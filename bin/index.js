#!/usr/bin/env node

import yargs from 'yargs';

console.log('Hello from projects CLI!');
console.log('Available commands:');
console.log('  projects help    - Show this help message');
console.log('  projects version - Show version');
console.log(yargs.argv);

const args = process.argv.slice(2);

if (args.includes('help') || args.includes('-h') || args.includes('--help')) {
  console.log('\nUsage: projects [command]');
  console.log('A CLI tool for managing projects');
} else if (args.includes('version') || args.includes('-v') || args.includes('--version')) {
  const pkg = require('../package.json');
  console.log(`v${pkg.version}`);
} else if (args.length === 0) {
  console.log('\nRun "projects help" for usage information');
} else {
  console.log(`\nUnknown command: ${args.join(' ')}`);
  console.log('Run "projects help" for available commands');
}