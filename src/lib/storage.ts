import type { Project } from '../types';

const STORAGE_KEY = 'project-autopilot:projects';
const CONFIG_KEY = 'project-autopilot:config';

export interface AppConfig {
  workspaceRoot: string;
  aiProvider: 'openai' | 'anthropic' | 'local';
  modelName: string;
  autonomyMode: 'SUPERVISED' | 'STANDARD' | 'AUTONOMOUS';
  setupComplete: boolean;
}

const defaultConfig: AppConfig = {
  workspaceRoot: '',
  aiProvider: 'openai',
  modelName: 'gpt-4o-mini',
  autonomyMode: 'STANDARD',
  setupComplete: false
};

export function getConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : defaultConfig;
  } catch {
    return defaultConfig;
  }
}

export function saveConfig(config: AppConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.push(project);
  }
  saveProjects(projects);
}

export function getProject(id: string): Project | undefined {
  const projects = getProjects();
  return projects.find((p) => p.id === id);
}
