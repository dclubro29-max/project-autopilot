import type { Project } from '../types';
import { AutonomousAgent } from './agent';

export class ProjectExecutor {
  private agent: AutonomousAgent;
  private isRunning = false;
  private abortController?: AbortController;

  constructor() {
    this.agent = new AutonomousAgent();
  }

  async run(project: Project): Promise<Project> {
    if (this.isRunning) {
      throw new Error('Agent already running');
    }

    this.isRunning = true;
    this.abortController = new AbortController();

    try {
      const result = await this.agent.executeProject(project);
      return result;
    } finally {
      this.isRunning = false;
      this.abortController = undefined;
    }
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    this.isRunning = true;
  }

  stop(): void {
    this.abortController?.abort();
    this.isRunning = false;
  }
}
