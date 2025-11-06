declare module 'tabtab' {
  export interface TabtabEnv {
    complete: boolean;
    words: number;
    point: number;
    line: string;
    partial: string;
    last: string;
    lastPartial: string;
    prev: string;
  }

  export interface InstallOptions {
    name: string;
    completer: string;
  }

  export interface UninstallOptions {
    name: string;
  }

  export function install(options: InstallOptions): Promise<void>;
  export function uninstall(options: UninstallOptions): Promise<void>;
  export function parseEnv(env: NodeJS.ProcessEnv): TabtabEnv;
  export function log(completions: string[]): void;
}
