export type ProjectType =
  | 'Software'
  | 'Website'
  | 'Mobile'
  | 'Firmware'
  | 'Electronics'
  | 'PCB'
  | 'CAD'
  | '3D Printing'
  | 'Robotics'
  | 'Automation'
  | 'Mixed'
  | 'Other';

export type AutonomyMode = 'SUPERVISED' | 'STANDARD' | 'AUTONOMOUS';

export type TaskStatus =
  | 'QUEUED'
  | 'READY'
  | 'RUNNING'
  | 'VERIFYING'
  | 'BLOCKED'
  | 'FAILED'
  | 'COMPLETED'
  | 'SKIPPED';

export type Priority = 'BLOCKER' | 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' | 'OPTIONAL';
export type Stage = 'ANALYZE' | 'PLAN' | 'IMPLEMENT' | 'VERIFY' | 'DOCUMENT';
export type VerificationStatus = 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT RUN';

export type ActivityKind =
  | 'Task started'
  | 'Reading'
  | 'Modified'
  | 'Running'
  | 'Failed'
  | 'Debugging'
  | 'Verified'
  | 'Milestone created'
  | 'Updated'
  | 'Checkpoint';

export interface WorkspaceFile {
  path: string;
  content: string;
  changed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dependencies: string[];
  verification: string;
  attempts: number;
  runtimeMs: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  kind: ActivityKind;
  label: string;
  detail: string;
  filePath?: string;
}

export interface Milestone {
  id: string;
  number: number;
  title: string;
  goal: string;
  completeAt: string;
  tasksCompleted: number;
  verification: string;
  evidence: string[];
}

export interface EvidenceItem {
  id: string;
  timestamp: string;
  project: string;
  task: string;
  milestone: string;
  type: string;
  description: string;
  filePath?: string;
  source: string;
  verification: VerificationStatus;
}

export interface TestRun {
  id: string;
  timestamp: string;
  command: string;
  summary: string;
  durationMs: number;
  status: VerificationStatus;
  details: string[];
}

export interface PermissionConfig {
  readFiles: 'ALLOW' | 'ASK' | 'DENY';
  modifyFiles: 'ALLOW' | 'ASK' | 'DENY';
  runTerminal: 'ALLOW' | 'ASK' | 'DENY';
  installPackages: 'ALLOW' | 'ASK' | 'DENY';
  gitCommit: 'ALLOW' | 'ASK' | 'DENY';
  gitPush: 'ALLOW' | 'ASK' | 'DENY';
}

export interface DocumentRecord {
  id: string;
  title: string;
  contents: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  goal: string;
  source: 'empty' | 'git' | 'local';
  autonomy: AutonomyMode;
  status: 'running' | 'paused' | 'completed' | 'blocked' | 'idle';
  currentStage: Stage;
  createdAt: string;
  updatedAt: string;
  permissions: PermissionConfig;
  runtimeMs: number;
  tasks: Task[];
  workspace: WorkspaceFile[];
  timeline: ActivityEvent[];
  milestones: Milestone[];
  evidence: EvidenceItem[];
  tests: TestRun[];
  documents: DocumentRecord[];
  latestVerification: string;
  projectStep: number;
}

export interface ProjectDraft {
  name: string;
  type: ProjectType;
  description: string;
  source: 'empty' | 'git' | 'local';
  goal: string;
  autonomy: AutonomyMode;
  permissions?: PermissionConfig;
}
