# CLI-Projects

A TypeScript-based CLI tool to manage and run commands across project groups.

## Overview

CLI-Projects helps you organize projects into groups and execute commands across all projects in a group simultaneously. Perfect for managing multiple related repositories, running batch operations, or keeping project groups in sync.

## Installation

```bash
npm install -g cli-projects
```

## Core Features

### 1. Project Groups Management

Organize your projects into logical groups with a base directory:

```bash
projects init                           # Create default config file
projects add <group-name> <base-path>   # Add a new group
projects add-project <group> <project>  # Add project to group
projects list <?group>                  # Show all groups or list specific group and their projects
```

### 2. Run Commands Across Projects

Execute any command across all projects in a group:

```bash
projects run <group> -- '<command>'     # Run command in each project directory
projects run <group> -n -- '<command>'  # Run from base directory (not in each project)
projects run <group> -d -- '<command>'  # Dry run (show what would execute)
```

## Configuration

Config file location: `~/.config/cli-projects/config.yml`

### Example Configuration

```yaml
groups:
  FRONTEND_PROJECTS:
    base: ~/Development/vue
    projects:
      - accounts-app
      - dashboard-app
      - admin-panel
      
  BACKEND_PROJECTS:
    base: ~/Development/api
    projects:
      - accounts-api
      - dashboard-api
```

## Environment Variables

Commands can use these environment variables:

- `${PROJECT}` - Current project name
- `${PROJECT_PATH}` - Full path to project directory
- `${PROJECT_BASE}` - Base directory path

### Example Usage

```bash
# Git pull all frontend projects
projects run FRONTEND_PROJECTS -- 'git pull'

# Check status with project name
projects run BACKEND_PROJECTS -- 'echo "Checking ${PROJECT}" && git status'

# Install dependencies across all projects
projects run FRONTEND_PROJECTS -- 'npm install'

# Run tests in all backend projects
projects run BACKEND_PROJECTS -- 'npm test'

# Dry run to preview commands
projects run FRONTEND_PROJECTS -d -- 'npm run build'
```

## Origin

This tool replaces and extends the functionality of a zsh `projects` function, bringing it to a cross-platform TypeScript implementation with better maintainability and extensibility.

## Development

### Setup

```bash
git clone https://github.com/RensHoogendam/Cli-Projects.git
cd Cli-Projects
npm install
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Link Locally

```bash
npm link
```

## Roadmap

### Phase 1: Core Implementation (Current)
- [ ] Config file management (YAML)
- [ ] Project group CRUD operations
- [ ] Basic command execution across projects
- [ ] Environment variable substitution
- [ ] Dry run mode
- [ ] Colorized output with progress indicators

### Phase 2: Enhanced Features (Future)
- [ ] Interactive mode with project selection
- [ ] Parallel execution option
- [ ] Output filtering and logging
- [ ] Git-specific commands (status, pull, push)
- [ ] Project templates
- [ ] Workspace support

## Tech Stack

- **TypeScript** - Type-safe development
- **Commander.js** - CLI framework
- **Chalk** - Terminal colors
- **js-yaml** - Config file parsing
- **ora** - Progress spinners

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.