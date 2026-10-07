import type { Project, Task, ActivityEvent, Milestone, EvidenceItem, DocumentRecord } from '../types';

export interface AgentConfig {
  maxIterations: number;
  taskTimeout: number;
  debugMaxAttempts: number;
}

const defaultConfig: AgentConfig = {
  maxIterations: 50,
  taskTimeout: 300000,
  debugMaxAttempts: 3
};

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
}

export interface WorkspaceState {
  files: Map<string, string>;
  modified: Set<string>;
  testsPassing: boolean;
}

export class AutonomousAgent {
  private config: AgentConfig;
  private iterationCount = 0;
  private workspace: WorkspaceState;

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.workspace = {
      files: new Map(),
      modified: new Set(),
      testsPassing: false
    };
  }

  async executeProject(project: Project): Promise<Project> {
    let current = { ...project };
    this.iterationCount = 0;
    this.initializeWorkspace(current);

    while (this.iterationCount < this.config.maxIterations && current.status === 'running') {
      this.iterationCount++;
      current = await this.executeOneIteration(current);
      
      if (this.shouldProjectComplete(current)) {
        current.status = 'completed';
        current = this.finalizeProject(current);
        break;
      }
    }

    return current;
  }

  private initializeWorkspace(project: Project): void {
    this.workspace.files.clear();
    this.workspace.modified.clear();
    project.workspace.forEach((file) => {
      this.workspace.files.set(file.path, file.content);
    });
  }

  private async executeOneIteration(project: Project): Promise<Project> {
    const now = new Date().toISOString();
    let current = { ...project, updatedAt: now, runtimeMs: project.runtimeMs + 6000 };

    // Find the next unblocked task
    const nextTask = this.selectNextTask(current);
    if (!nextTask) {
      return current;
    }

    // Update task to RUNNING
    const taskIndex = current.tasks.findIndex((t) => t.id === nextTask.id);
    if (taskIndex >= 0) {
      current.tasks[taskIndex].status = 'RUNNING';
      current.tasks[taskIndex].runtimeMs += 6000;
    }

    current.currentStage = 'IMPLEMENT';

    // Execute the task based on description
    const result = await this.executeTask(nextTask, current);

    // Record activity
    current.timeline = [
      {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: now,
        kind: 'Running',
        label: 'Running',
        detail: nextTask.title,
        filePath: undefined
      },
      ...current.timeline.slice(0, 19)
    ];

    // Execute verification
    current = this.verifyTask(nextTask, current, result);

    // Handle failure with debugging
    if (result.success === false && nextTask.verification.toLowerCase().includes('test')) {
      current = await this.debugFailedTask(nextTask, current);
    }

    // If task verification passed, mark it complete
    if (current.latestVerification === 'PASS') {
      if (taskIndex >= 0) {
        current.tasks[taskIndex].status = 'COMPLETED';
      }

      // Check if we should create a milestone
      if (this.shouldCreateMilestone(current)) {
        current = this.createMilestone(current);
      }
    }

    return current;
  }

  private selectNextTask(project: Project): Task | undefined {
    // Find first task that is QUEUED or READY
    for (const task of project.tasks) {
      if (task.status === 'QUEUED' || task.status === 'READY') {
        // Check dependencies
        const dependenciesMet = task.dependencies.every(
          (depId) => project.tasks.find((t) => t.id === depId)?.status === 'COMPLETED'
        );
        if (dependenciesMet) {
          return task;
        }
      }
    }
    return undefined;
  }

  private async executeTask(task: Task, project: Project): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Simulate different task types
      if (task.title.toLowerCase().includes('audit')) {
        return await this.auditWorkspace(project, startTime);
      } else if (task.title.toLowerCase().includes('plan')) {
        return await this.planTasks(project, startTime);
      } else if (task.title.toLowerCase().includes('implement') || task.title.toLowerCase().includes('patch')) {
        return await this.implementChange(task, project, startTime);
      } else if (task.title.toLowerCase().includes('test') || task.title.toLowerCase().includes('verify')) {
        return await this.runTests(project, startTime);
      } else if (task.title.toLowerCase().includes('document')) {
        return await this.documentChanges(task, project, startTime);
      }

      return {
        success: true,
        output: `Executed: ${task.title}`,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: String(error),
        duration: Date.now() - startTime
      };
    }
  }

  private async auditWorkspace(project: Project, startTime: number): Promise<ExecutionResult> {
    // Simulate reading workspace
    const fileCount = this.workspace.files.size;
    const output = `Workspace audit complete. Found ${fileCount} files. Dependencies OK.`;
    return { success: true, output, duration: Date.now() - startTime };
  }

  private async planTasks(project: Project, startTime: number): Promise<ExecutionResult> {
    const output = 'Task plan generated. Ready to implement.';
    return { success: true, output, duration: Date.now() - startTime };
  }

  private async implementChange(task: Task, project: Project, startTime: number): Promise<ExecutionResult> {
    // Make a real modification to a file
    const files = Array.from(this.workspace.files.keys());
    if (files.length > 0 && files[0].endsWith('.js')) {
      const filePath = files[0];
      const content = this.workspace.files.get(filePath) || '';
      const modified = content + '\n// Implementation complete';
      this.workspace.files.set(filePath, modified);
      this.workspace.modified.add(filePath);

      // Update project workspace
      const idx = project.workspace.findIndex((f) => f.path === filePath);
      if (idx >= 0) {
        project.workspace[idx].content = modified;
        project.workspace[idx].changed = true;
      }

      return { success: true, output: `Modified ${filePath}`, duration: Date.now() - startTime };
    }
    return { success: false, output: '', error: 'No files to modify', duration: Date.now() - startTime };
  }

  private async runTests(project: Project, startTime: number): Promise<ExecutionResult> {
    // Simulate test run
    const testsPassed = Math.random() > 0.2; // 80% pass rate
    this.workspace.testsPassing = testsPassed;
    const duration = Date.now() - startTime;
    return {
      success: testsPassed,
      output: testsPassed
        ? '2 tests passed. No failures.'
        : '2 tests FAILED: assertion mismatch',
      duration
    };
  }

  private async documentChanges(task: Task, project: Project, startTime: number): Promise<ExecutionResult> {
    const output = 'Documentation updated. BUILD_LOG.md recorded.';
    return { success: true, output, duration: Date.now() - startTime };
  }

  private verifyTask(task: Task, project: Project, result: ExecutionResult): Project {
    const now = new Date().toISOString();
    const current = { ...project };

    if (result.success) {
      current.latestVerification = 'PASS';
      current.evidence = [
        {
          id: `ev-${Date.now()}`,
          timestamp: now,
          project: current.name,
          task: task.id,
          milestone: '',
          type: 'Execution result',
          description: result.output,
          source: 'agent',
          verification: 'PASS'
        },
        ...current.evidence.slice(0, 9)
      ];
    } else {
      current.latestVerification = 'FAIL';
      current.evidence = [
        {
          id: `ev-${Date.now()}`,
          timestamp: now,
          project: current.name,
          task: task.id,
          milestone: '',
          type: 'Error',
          description: result.error || 'Task failed',
          source: 'agent',
          verification: 'FAIL'
        },
        ...current.evidence.slice(0, 9)
      ];
    }

    return current;
  }

  private async debugFailedTask(task: Task, project: Project): Promise<Project> {
    // Attempt to fix the failed task
    const current = { ...project };

    // Increment task attempts
    const taskIdx = current.tasks.findIndex((t) => t.id === task.id);
    if (taskIdx >= 0) {
      current.tasks[taskIdx].attempts += 1;
      if (current.tasks[taskIdx].attempts <= this.config.debugMaxAttempts) {
        current.tasks[taskIdx].status = 'RUNNING';
        current.latestVerification = 'PARTIAL';
      } else {
        current.tasks[taskIdx].status = 'FAILED';
      }
    }

    return current;
  }

  private shouldCreateMilestone(project: Project): boolean {
    const completed = project.tasks.filter((t) => t.status === 'COMPLETED').length;
    return completed > 0 && completed % 2 === 0; // Create every 2 tasks
  }

  private createMilestone(project: Project): Project {
    const now = new Date().toISOString();
    const current = { ...project };
    const completed = current.tasks.filter((t) => t.status === 'COMPLETED').length;

    current.milestones = [
      {
        id: `m-${Date.now()}`,
        number: current.milestones.length + 1,
        title: `Milestone ${current.milestones.length + 1}: ${completed} tasks completed`,
        goal: `Verified completion of ${completed} work items`,
        completeAt: now,
        tasksCompleted: completed,
        verification: 'PASS',
        evidence: current.evidence.slice(0, 3).map((e) => e.id)
      },
      ...current.milestones
    ];

    // Update documentation
    const buildLog = current.documents.find((d) => d.title === 'BUILD_LOG.md');
    if (buildLog) {
      buildLog.contents += `\n## Milestone ${current.milestones[0].number}\n${current.milestones[0].title}\n`;
      buildLog.updatedAt = now;
    }

    return current;
  }

  private shouldProjectComplete(project: Project): boolean {
    const allDone = project.tasks.every(
      (t) => t.status === 'COMPLETED' || t.status === 'SKIPPED' || t.status === 'FAILED'
    );
    const enoughCompleted = project.tasks.filter((t) => t.status === 'COMPLETED').length >= 3;
    return allDone && enoughCompleted;
  }

  private finalizeProject(project: Project): Project {
    const now = new Date().toISOString();
    const current = { ...project, status: 'completed' as const, updatedAt: now };

    // Generate final report
    const completed = current.tasks.filter((t) => t.status === 'COMPLETED').length;
    const report: DocumentRecord = {
      id: `doc-${Date.now()}`,
      title: 'FINAL_REPORT.md',
      contents: `# Project Completion Report\n\n## ${current.name}\n\n**Status:** Complete\n**Tasks Completed:** ${completed}/${current.tasks.length}\n**Milestones:** ${current.milestones.length}\n**Runtime:** ${Math.round(current.runtimeMs / 1000)}s\n**Test Pass Rate:** ${current.tests.filter((t) => t.status === 'PASS').length}/${current.tests.length}\n\n`,
      updatedAt: now
    };

    current.documents = [report, ...current.documents];
    return current;
  }
}
