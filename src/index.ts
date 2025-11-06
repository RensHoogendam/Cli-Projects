#!/usr/bin/env node

interface ProjectCommand {
  name: string;
  description: string;
}

class ProjectsCLI {
  private commands: ProjectCommand[] = [
    { name: 'init', description: 'Initialize a new project' },
    { name: 'list', description: 'List all projects' },
    { name: 'create', description: 'Create a new project' }
  ];

  public run(): void {
    const args: string[] = process.argv.slice(2);
    
    if (args.length === 0) {
      this.showHelp();
      return;
    }

    const command: string = args[0];
    
    switch (command) {
      case 'init':
        this.initProject();
        break;
      case 'list':
        this.listProjects();
        break;
      case 'create':
        this.createProject(args[1]);
        break;
      case '--help':
      case '-h':
        this.showHelp();
        break;
      default:
        console.log(`Unknown command: ${command}`);
        this.showHelp();
    }
  }

  private showHelp(): void {
    console.log('Projects CLI Tool\n');
    console.log('Usage: projects <command> [options]\n');
    console.log('Commands:');
    this.commands.forEach(cmd => {
      console.log(`  ${cmd.name.padEnd(10)} ${cmd.description}`);
    });
    console.log('  --help     Show this help message');
  }

  private initProject(): void {
    console.log('Initializing new project...');
    // Add your project initialization logic here
  }

  private listProjects(): void {
    console.log('Listing all projects...');
    // Add your project listing logic here
  }

  private createProject(name?: string): void {
    if (!name) {
      console.log('Error: Project name is required');
      console.log('Usage: projects create <project-name>');
      return;
    }
    console.log(`Creating project: ${name}`);
    // Add your project creation logic here
  }
}

// Run the CLI
const cli = new ProjectsCLI();
cli.run();