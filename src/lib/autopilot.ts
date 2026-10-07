import type { EvidenceItem, Milestone, Project, ProjectDraft, Task, TestRun, VerificationStatus, WorkspaceFile } from '../types';

export const STORAGE_KEY = 'project-autopilot:v1';

const baseFiles: WorkspaceFile[] = [
  {
    path: 'README.md',
    content: '# Starbie\n\nA lightweight project tracking and session utility.\n',
    changed: false
  },
  {
    path: 'src/config.js',
    content: "export const appName = 'Starbie';\nexport const version = '0.1.0';\n",
    changed: false
  },
  {
    path: 'src/runner.js',
    content: "export function boot() {\n  return 'starting';\n}\n",
    changed: false
  },
  {
    path: 'tests/app.test.js',
    content: "describe('boot', () => {\n  it('starts app', () => {\n    expect('starting').toBe('starting');\n  });\n});\n",
    changed: false
  }
];

export function buildDemoProject(): Project {
  const now = new Date().toISOString();

  const tasks: Task[] = [
    {
      id: 't-1',
      title: 'Audit workspace and app state',
      description: 'Inspect repository structure, read lock files, and identify the likely failing path.',
      priority: 'CRITICAL',
      status: 'RUNNING',
      dependencies: [],
      verification: 'Repository summary captured and relevant sources identified.',
      attempts: 1,
      runtimeMs: 326000
    },
    {
      id: 't-2',
      title: 'Patch bootstrap regression',
      description: 'Correct the startup and config integration for the app shell.',
      priority: 'HIGH',
      status: 'QUEUED',
      dependencies: ['t-1'],
      verification: 'Critical startup path works and config loads without errors.',
      attempts: 0,
      runtimeMs: 0
    },
    {
      id: 't-3',
      title: 'Verify automated tests',
      description: 'Run the app test suite and confirm the new startup path remains green.',
      priority: 'HIGH',
      status: 'QUEUED',
      dependencies: ['t-2'],
      verification: 'Test suite passes without regressions.',
      attempts: 0,
      runtimeMs: 0
    },
    {
      id: 't-4',
      title: 'Document changes and milestone',
      description: 'Capture the verified build and summarize key decisions for future work.',
      priority: 'NORMAL',
      status: 'QUEUED',
      dependencies: ['t-3'],
      verification: 'Build log and final report updated with real evidence.',
      attempts: 0,
      runtimeMs: 0
    }
  ];

  const tests: TestRun[] = [
    {
      id: 'r-1',
      timestamp: now,
      command: 'npm test -- --runInBand',
      summary: 'Startup regression is being resolved.',
      durationMs: 2400,
      status: 'PARTIAL',
      details: ['One validation is still running.']
    }
  ];

  const timeline = [
    {
      id: 'a-1',
      timestamp: now,
      kind: 'Task started',
      label: 'Task started',
      detail: 'Audit workspace and app state',
      filePath: 'README.md'
    },
    {
      id: 'a-2',
      timestamp: now,
      kind: 'Reading',
      label: 'Reading',
      detail: 'src/config.js',
      filePath: 'src/config.js'
    }
  ];

  return {
    id: 'project-demo',
    name: 'Starbie',
    type: 'Software',
    description: 'Project health and session tracking utility.',
    goal: 'Complete the startup regression, verify the app passes tests, and document the real milestone.',
    source: 'empty',
    autonomy: 'AUTONOMOUS',
    status: 'running',
    currentStage: 'ANALYZE',
    createdAt: now,
    updatedAt: now,
    permissions: {
      readFiles: 'ALLOW',
      modifyFiles: 'ALLOW',
      runTerminal: 'ALLOW',
      installPackages: 'ASK',
      gitCommit: 'ALLOW',
      gitPush: 'DENY'
    },
    runtimeMs: 1560000,
    tasks,
    workspace: baseFiles,
    timeline,
    milestones: [],
    evidence: [
      {
        id: 'e-1',
        timestamp: now,
        project: 'Starbie',
        task: 't-1',
        milestone: 'M001',
        type: 'Generated artifact',
        description: 'Repository analysis captured for startup investigation.',
        filePath: 'README.md',
        source: 'agent.audit',
        verification: 'PARTIAL'
      }
    ],
    tests,
    documents: [
      {
        id: 'd-1',
        title: 'BUILD_LOG.md',
        contents: '## Milestone 1 — Initial analysis\n\nRepository scanned and startup issue identified.\n',
        updatedAt: now
      }
    ],
    latestVerification: 'In progress',
    projectStep: 0
  };
}

export function makeProjectDraft(draft: ProjectDraft): Project {
  const now = new Date().toISOString();
  return {
    id: `project-${Date.now()}`,
    name: draft.name,
    type: draft.type,
    description: draft.description,
    goal: draft.goal,
    source: draft.source,
    autonomy: draft.autonomy,
    status: 'running',
    currentStage: 'ANALYZE',
    createdAt: now,
    updatedAt: now,
    permissions: {
      readFiles: 'ALLOW',
      modifyFiles: 'ALLOW',
      runTerminal: 'ALLOW',
      installPackages: 'ASK',
      gitCommit: 'ALLOW',
      gitPush: 'DENY'
    },
    runtimeMs: 0,
    tasks: [
      {
        id: 't-1',
        title: 'Audit project state',
        description: 'Inspect the workspace, repo metadata, and likely constraints before building.',
        priority: 'CRITICAL',
        status: 'RUNNING',
        dependencies: [],
        verification: 'Project structure and blocker analysis captured.',
        attempts: 1,
        runtimeMs: 0
      },
      {
        id: 't-2',
        title: 'Define implementation plan',
        description: 'Capture the work plan and identify the most valuable next engineering step.',
        priority: 'HIGH',
        status: 'QUEUED',
        dependencies: ['t-1'],
        verification: 'Task plan is meaningful and traceable to the project goal.',
        attempts: 0,
        runtimeMs: 0
      }
    ],
    workspace: [
      {
        path: 'README.md',
        content: `# ${draft.name}\n\n${draft.goal}\n`,
        changed: false
      }
    ],
    timeline: [
      {
        id: `${Date.now()}-timeline`,
        timestamp: now,
        kind: 'Task started',
        label: 'Task started',
        detail: 'Audit project state',
        filePath: 'README.md'
      }
    ],
    milestones: [],
    evidence: [],
    tests: [],
    documents: [
      {
        id: `doc-${Date.now()}`,
        title: 'BUILD_LOG.md',
        contents: `# ${draft.name}\n\nProject created and initial analysis started.\n`,
        updatedAt: now
      }
    ],
    latestVerification: 'Awaiting inspection',
    projectStep: 0
  };
}

export function nextProjectState(project: Project): Project {
  if (project.status === 'paused' || project.status === 'completed') {
    return project;
  }

  const now = new Date().toISOString();
  const nextProject: Project = {
    ...project,
    updatedAt: now,
    runtimeMs: project.runtimeMs + 120000,
    projectStep: project.projectStep + 1
  };

  const currentTask = nextProject.tasks.find((task) => task.status === 'RUNNING') ?? nextProject.tasks[0];

  if (currentTask) {
    currentTask.runtimeMs += 120000;
    currentTask.attempts += 1;
  }

  if (nextProject.projectStep === 1) {
    nextProject.currentStage = 'PLAN';
    nextProject.timeline = [
      {
        id: `${Date.now()}-timeline-1`,
        timestamp: now,
        kind: 'Updated',
        label: 'Project state updated',
        detail: 'Project plan generated and scoped to the next value-add work.',
        filePath: 'README.md'
      },
      ...nextProject.timeline
    ];
    if (nextProject.tasks[0]) {
      nextProject.tasks[0].status = 'COMPLETED';
      nextProject.tasks[1].status = 'RUNNING';
      nextProject.latestVerification = 'Task plan in progress';
    }
  } else if (nextProject.projectStep === 2) {
    nextProject.currentStage = 'IMPLEMENT';
    nextProject.tasks[1].status = 'COMPLETED';
    nextProject.tasks[2].status = 'RUNNING';
    nextProject.workspace = nextProject.workspace.map((file) =>
      file.path === 'src/config.js' ? { ...file, changed: true, content: file.content + '\nexport const bootMode = "safe";\n' } : file
    );
    nextProject.timeline = [
      {
        id: `${Date.now()}-timeline-2`,
        timestamp: now,
        kind: 'Modified',
        label: 'Modified',
        detail: 'src/config.js',
        filePath: 'src/config.js'
      },
      ...nextProject.timeline
    ];
  } else if (nextProject.projectStep === 3) {
    nextProject.currentStage = 'VERIFY';
    nextProject.tasks[2].status = 'VERIFYING';
    nextProject.tests = [
      {
        id: `run-${Date.now()}`,
        timestamp: now,
        command: 'npm test -- --runInBand',
        summary: 'Startup regression fixed and test suite is passing.',
        durationMs: 4200,
        status: 'PASS',
        details: ['2 assertions passed', 'No regressions detected']
      },
      ...nextProject.tests
    ];
    nextProject.latestVerification = 'PASS';
    nextProject.evidence = [
      {
        id: `ev-${Date.now()}`,
        timestamp: now,
        project: nextProject.name,
        task: 't-3',
        milestone: 'M001',
        type: 'Test result',
        description: 'Startup regression test verified successfully.',
        filePath: 'tests/app.test.js',
        source: 'terminal',
        verification: 'PASS'
      },
      ...nextProject.evidence
    ];
  } else if (nextProject.projectStep === 4) {
    nextProject.currentStage = 'DOCUMENT';
    nextProject.tasks[2].status = 'COMPLETED';
    nextProject.tasks[3].status = 'RUNNING';
    nextProject.milestones = [
      {
        id: `m-${Date.now()}`,
        number: 1,
        title: 'Startup regression resolved',
        goal: 'Restore a clean boot path and verified app startup.',
        completeAt: now,
        tasksCompleted: 3,
        verification: 'PASS',
        evidence: ['tests/app.test.js']
      },
      ...nextProject.milestones
    ];
    nextProject.documents = nextProject.documents.map((doc) =>
      doc.title === 'BUILD_LOG.md'
        ? {
            ...doc,
            contents: `${doc.contents}\n## Milestone 1 — Startup regression resolved\n\nThe bootstrap path was repaired and validated.\n`,
            updatedAt: now
          }
        : doc
    );
  } else {
    nextProject.status = 'completed';
    nextProject.currentStage = 'DOCUMENT';
    nextProject.tasks[3].status = 'COMPLETED';
    nextProject.latestVerification = 'Project complete';
    nextProject.timeline = [
      {
        id: `${Date.now()}-timeline-3`,
        timestamp: now,
        kind: 'Milestone created',
        label: 'Milestone created',
        detail: 'Startup regression resolved',
        filePath: 'BUILD_LOG.md'
      },
      ...nextProject.timeline
    ];
  }

  return nextProject;
}

export function storageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

export function loadProjects(): Project[] {
  if (!storageAvailable()) {
    return [buildDemoProject()];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [buildDemoProject()];
  }

  try {
    const parsed = JSON.parse(raw) as Project[];
    return parsed.length ? parsed : [buildDemoProject()];
  } catch {
    return [buildDemoProject()];
  }
}

export function saveProjects(projects: Project[]) {
  if (!storageAvailable()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getProjectMetrics(project: Project) {
  const complete = project.tasks.filter((task) => task.status === 'COMPLETED').length;
  const percent = project.tasks.length ? Math.round((complete / project.tasks.length) * 100) : 0;
  return {
    complete,
    percent,
    testPass: project.tests.filter((item) => item.status === 'PASS').length,
    filesChanged: project.workspace.filter((file) => file.changed).length,
    milestoneCount: project.milestones.length
  };
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    running: 'status-running',
    paused: 'status-paused',
    blocked: 'status-blocked',
    completed: 'status-complete',
    idle: 'status-idle'
  };
  return map[status] ?? 'status-idle';
}

export const pipelineStages = ['ANALYZE', 'PLAN', 'IMPLEMENT', 'VERIFY', 'DOCUMENT'] as const;

export const statusTone: Record<VerificationStatus, string> = {
  PASS: 'pass',
  FAIL: 'fail',
  PARTIAL: 'partial',
  'NOT RUN': 'not-run'
};
