import { useEffect, useMemo, useState } from 'react';
import {
  buildDemoProject,
  formatDuration,
  getProjectMetrics,
  getStatusClass,
  loadProjects,
  nextProjectState,
  pipelineStages,
  saveProjects,
  statusTone
} from './lib/autopilot';
import type { EvidenceItem, Project, ProjectDraft, VerificationStatus } from './types';

const navItems = [
  { key: 'command-center', label: 'Command Center' },
  { key: 'projects', label: 'Projects' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'tests', label: 'Tests' },
  { key: 'docs', label: 'Documentation' },
  { key: 'settings', label: 'Settings' }
] as const;

const projectTypes = ['Software', 'Website', 'Mobile', 'Firmware', 'Electronics', 'PCB', 'CAD', '3D Printing', 'Robotics', 'Automation', 'Mixed', 'Other'] as const;

function App() {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => loadProjects()[0]?.id ?? 'project-demo');
  const [view, setView] = useState<(typeof navItems)[number]['key']>('command-center');
  const [createOpen, setCreateOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizard, setWizard] = useState<ProjectDraft>({
    name: 'Fresh Project',
    type: 'Software',
    description: 'Autonomous engineering project.',
    source: 'empty',
    goal: 'Define the objective for the project and let the agent decide the best route.',
    autonomy: 'STANDARD',
    permissions: {
      readFiles: 'ALLOW',
      modifyFiles: 'ALLOW',
      runTerminal: 'ALLOW',
      installPackages: 'ASK',
      gitCommit: 'ALLOW',
      gitPush: 'DENY'
    }
  });

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId]
  );

  useEffect(() => {
    if (!selectedProject && projects.length) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProject]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProjects((previous) => previous.map((project) => nextProjectState(project)));
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const createProject = () => {
    const nextProject = {
      name: wizard.name || 'Autopilot Project',
      type: wizard.type,
      description: wizard.description,
      source: wizard.source,
      goal: wizard.goal,
      autonomy: wizard.autonomy,
      permissions: wizard.permissions ?? {
        readFiles: 'ALLOW',
        modifyFiles: 'ALLOW',
        runTerminal: 'ALLOW',
        installPackages: 'ASK',
        gitCommit: 'ALLOW',
        gitPush: 'DENY'
      }
    };

    const project: Project = {
      ...buildDemoProject(),
      id: `project-${Date.now()}`,
      name: nextProject.name,
      type: nextProject.type,
      description: nextProject.description,
      goal: nextProject.goal,
      source: nextProject.source,
      autonomy: nextProject.autonomy,
      status: 'running',
      currentStage: 'ANALYZE',
      permissions: nextProject.permissions,
      tasks: [
        {
          id: 't-1',
          title: 'Audit project state',
          description: nextProject.goal,
          priority: 'CRITICAL',
          status: 'RUNNING',
          dependencies: [],
          verification: 'Project captured and actionable next step identified.',
          attempts: 1,
          runtimeMs: 0
        },
        {
          id: 't-2',
          title: 'Define implementation plan',
          description: 'Turn the objective into a concrete engineering plan.',
          priority: 'HIGH',
          status: 'QUEUED',
          dependencies: ['t-1'],
          verification: 'Plan matches the goal and has clear validation steps.',
          attempts: 0,
          runtimeMs: 0
        }
      ],
      timeline: [
        {
          id: `${Date.now()}-startup`,
          timestamp: new Date().toISOString(),
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
          contents: `# ${nextProject.name}\n\nInitial workspace created with objective captured.\n`,
          updatedAt: new Date().toISOString()
        }
      ],
      latestVerification: 'Awaiting first verification',
      projectStep: 0
    };

    setProjects((previous) => [project, ...previous]);
    setSelectedProjectId(project.id);
    setCreateOpen(false);
    setWizardStep(0);
    setView('command-center');
  };

  const projectMetrics = selectedProject ? getProjectMetrics(selectedProject) : { complete: 0, percent: 0, testPass: 0, filesChanged: 0, milestoneCount: 0 };

  const wizardSteps = [
    { title: 'Project', content: (
      <>
        <label>Project name<input value={wizard.name} onChange={(e) => setWizard({ ...wizard, name: e.target.value })} /></label>
        <label>Project type<select value={wizard.type} onChange={(e) => setWizard({ ...wizard, type: e.target.value as ProjectDraft['type'] })}>{projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <label className="full-width">Short description<input value={wizard.description} onChange={(e) => setWizard({ ...wizard, description: e.target.value })} /></label>
      </>
    ) },
    { title: 'Source', content: (
      <label className="full-width">Source<select value={wizard.source} onChange={(e) => setWizard({ ...wizard, source: e.target.value as ProjectDraft['source'] })}><option value="empty">Create empty workspace</option><option value="git">Import Git repository</option><option value="local">Select local workspace</option></select></label>
    ) },
    { title: 'Goal', content: (
      <label className="full-width">What should Autopilot build?<textarea value={wizard.goal} rows={6} onChange={(e) => setWizard({ ...wizard, goal: e.target.value })} /></label>
    ) },
    { title: 'Autonomy', content: (
      <label className="full-width">Autonomy mode<select value={wizard.autonomy} onChange={(e) => setWizard({ ...wizard, autonomy: e.target.value as ProjectDraft['autonomy'] })}><option value="SUPERVISED">SUPERVISED — Ask before meaningful changes.</option><option value="STANDARD">STANDARD — Autonomous local development with human approval for consequential actions.</option><option value="AUTONOMOUS">AUTONOMOUS — Continue automatically while respecting safety boundaries.</option></select></label>
    ) },
    { title: 'Permissions', content: (
      <div className="permission-grid">
        {Object.entries(wizard.permissions ?? {
          readFiles: 'ALLOW',
          modifyFiles: 'ALLOW',
          runTerminal: 'ALLOW',
          installPackages: 'ASK',
          gitCommit: 'ALLOW',
          gitPush: 'DENY'
        }).map(([key, value]) => (
          <label key={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}<select value={value} onChange={(e) => setWizard({ ...wizard, permissions: { ...(wizard.permissions ?? { readFiles: 'ALLOW', modifyFiles: 'ALLOW', runTerminal: 'ALLOW', installPackages: 'ASK', gitCommit: 'ALLOW', gitPush: 'DENY' }), [key]: e.target.value as 'ALLOW' | 'ASK' | 'DENY' } })}>{['ALLOW','ASK','DENY'].map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        ))}
      </div>
    ) },
    { title: 'Review', content: (
      <div className="review-box">
        <div><strong>Project</strong> {wizard.name}</div>
        <div><strong>Type</strong> {wizard.type}</div>
        <div><strong>Goal</strong> {wizard.goal}</div>
        <div><strong>Autonomy</strong> {wizard.autonomy}</div>
        <div><strong>Permissions</strong> {Object.entries(wizard.permissions ?? {}).map(([k,v]) => `${k}:${v}`).join(' · ')}</div>
      </div>
    ) }
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="brand-row">
          <div className="brand-mark">PA</div>
          {sidebarOpen && <div className="brand-copy"><strong>PROJECT</strong><span>AUTOPILOT</span></div>}
        </div>

        <nav className="nav-stack">
          <div className="nav-label">COMMAND CENTER</div>
          {navItems.map((item) => (
            <button key={item.key} className={`nav-item ${view === item.key ? 'active' : ''}`} onClick={() => setView(item.key)}>
              {sidebarOpen ? item.label : item.label.slice(0, 1)}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="model-pill"><span className="indicator online" /> {sidebarOpen ? 'OpenAI · GPT-4.1' : 'AI'}</div>
          <button className="mini-button" onClick={() => setSidebarOpen((value) => !value)}>{sidebarOpen ? 'Collapse' : 'Expand'}</button>
        </div>
      </aside>

      <main className="content-shell">
        <header className="topbar">
          {selectedProject ? (
            <>
              <div className="project-banner">
                <div>
                  <div className="eyebrow">PROJECT CONTROL</div>
                  <h1>{selectedProject.name}</h1>
                </div>
                <div className="status-line">
                  <span className={`status-badge ${getStatusClass(selectedProject.status)}`}>{selectedProject.status.toUpperCase()}</span>
                  <span className="muted">{selectedProject.type}</span>
                </div>
              </div>
              <div className="top-actions">
                <button className="ghost-button">Pause</button>
                <button className="ghost-button">Resume</button>
                <button className="primary-button">Stop</button>
              </div>
            </>
          ) : (
            <div className="project-banner"><div><div className="eyebrow">MISSION CONTROL</div><h1>Command Center</h1></div></div>
          )}
        </header>

        {view === 'command-center' && (
          <div className="page-stack">
            <section className="stats-grid">
              <StatCard label="Active Projects" value={String(projects.filter((project) => project.status === 'running').length)} />
              <StatCard label="Completed Projects" value={String(projects.filter((project) => project.status === 'completed').length)} />
              <StatCard label="Agent Runtime" value={formatDuration(projects.reduce((sum, project) => sum + project.runtimeMs, 0))} />
              <StatCard label="Tasks Completed" value={String(projects.reduce((sum, project) => sum + project.tasks.filter((task) => task.status === 'COMPLETED').length, 0))} />
            </section>

            <section className="panel">
              <div className="panel-header"><h2>ACTIVE PROJECTS</h2><button className="primary-button small" onClick={() => setCreateOpen(true)}>New Project</button></div>
              <div className="project-list">
                {projects.map((project) => (
                  <div key={project.id} className="project-row">
                    <div>
                      <div className="row-title">{project.name}</div>
                      <div className="row-meta">{project.type} · {project.status.toUpperCase()}</div>
                    </div>
                    <div className="row-detail">
                      <span>Current task</span>
                      <strong>{project.tasks.find((task) => task.status === 'RUNNING')?.title ?? 'Idle'}</strong>
                    </div>
                    <div className="row-detail">
                      <span>Runtime</span>
                      <strong>{formatDuration(project.runtimeMs)}</strong>
                    </div>
                    <div className="row-detail action-col">
                      <button onClick={() => { setSelectedProjectId(project.id); setView('projects'); }}>Open</button>
                      <button>Pause</button>
                      <button>Resume</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header"><h2>RECENT MILESTONES</h2></div>
              <div className="milestone-list">
                {projects.flatMap((project) => project.milestones).slice(0, 3).map((milestone) => (
                  <div key={milestone.id} className="milestone-card">
                    <div className="milestone-title">M{milestone.number} · {milestone.title}</div>
                    <div className="muted">{milestone.goal}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {view === 'projects' && selectedProject && (
          <div className="page-stack">
            <section className="project-overview panel">
              <div className="panel-header compact">
                <div>
                  <div className="eyebrow">CURRENT OPERATION</div>
                  <h2>{selectedProject.tasks.find((task) => task.status === 'RUNNING')?.title ?? 'Analyzing workspace'}</h2>
                </div>
                <div className="status-badge alt">{selectedProject.currentStage}</div>
              </div>
              <div className="metrics-strip">
                <Metric value={`${projectMetrics.percent}%`} label="Progress" />
                <Metric value={String(projectMetrics.complete)} label="Tasks complete" />
                <Metric value={formatDuration(selectedProject.runtimeMs)} label="Agent runtime" />
                <Metric value={String(projectMetrics.testPass)} label="Tests passing" />
                <Metric value={String(projectMetrics.milestoneCount)} label="Milestones" />
                <Metric value={String(projectMetrics.filesChanged)} label="Files changed" />
              </div>
              <div className="pipeline">
                {pipelineStages.map((stage, index) => (
                  <div key={stage} className={`pipeline-step ${stage === selectedProject.currentStage ? 'current' : ''}`}>
                    <span>{index + 1}</span>
                    <strong>{stage}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="split-grid">
              <div className="panel">
                <div className="panel-header"><h2>LIVE ACTIVITY</h2></div>
                <div className="timeline">
                  {selectedProject.timeline.slice(0, 8).map((event) => (
                    <div key={event.id} className="timeline-item">
                      <div className="timecode">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      <div className="timeline-body"><strong>{event.kind}</strong><div>{event.detail}</div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header"><h2>TASK GRAPH</h2></div>
                <div className="task-table">
                  {selectedProject.tasks.map((task) => (
                    <div key={task.id} className="task-row">
                      <div className="task-head"><span className="task-id">{task.id}</span><span className="task-status">{task.status}</span></div>
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">{task.priority} · {task.verification}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'evidence' && (
          <div className="page-stack">
            <section className="panel"><div className="panel-header"><h2>EVIDENCE</h2></div><div className="evidence-grid">{(selectedProject?.evidence ?? []).map((evidence) => <EvidenceCard key={evidence.id} item={evidence} />)}</div></section>
          </div>
        )}

        {view === 'tests' && (
          <div className="page-stack">
            <section className="panel"><div className="panel-header"><h2>TEST CENTER</h2></div><div className="test-list">{(selectedProject?.tests ?? []).map((test) => <div key={test.id} className="test-row"><div className="test-topline"><strong>{test.command}</strong><span className={`verification-pill ${statusTone[test.status as VerificationStatus]}`}>{test.status}</span></div><div className="muted">{test.summary}</div><div className="task-meta">{test.details.join(' · ')}</div></div>)}</div></section>
          </div>
        )}

        {view === 'docs' && (
          <div className="page-stack">
            <section className="panel"><div className="panel-header"><h2>DOCUMENTATION</h2></div><div className="doc-stack">{(selectedProject?.documents ?? []).map((doc) => <pre key={doc.id} className="doc-block">{doc.contents}</pre>)}</div></section>
          </div>
        )}

        {view === 'settings' && (
          <div className="page-stack">
            <section className="panel settings-grid"><div><h2>General</h2><div className="setting-row"><span>Model</span><strong>GPT-4.1</strong></div><div className="setting-row"><span>Autonomy</span><strong>{selectedProject?.autonomy ?? 'STANDARD'}</strong></div></div><div><h2>Permissions</h2><div className="setting-row"><span>Run terminal</span><strong>{selectedProject?.permissions.runTerminal ?? 'ALLOW'}</strong></div><div className="setting-row"><span>Git push</span><strong>{selectedProject?.permissions.gitPush ?? 'DENY'}</strong></div></div></section>
          </div>
        )}
      </main>

      {createOpen && (
        <div className="modal-backdrop" onClick={() => setCreateOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header compact">
              <h2>New Project</h2>
              <button className="ghost-button" onClick={() => setCreateOpen(false)}>Close</button>
            </div>

            <div className="wizard-steps"><div className="step-indicator">STEP {wizardStep + 1} — {wizardSteps[wizardStep].title}</div></div>
            <div className="wizard-grid">{wizardSteps[wizardStep].content}</div>
            <div className="modal-actions">
              <button className="ghost-button" disabled={wizardStep === 0} onClick={() => setWizardStep((step) => Math.max(0, step - 1))}>Back</button>
              {wizardStep < wizardSteps.length - 1 ? (
                <button className="primary-button" onClick={() => setWizardStep((step) => Math.min(wizardSteps.length - 1, step + 1))}>Next</button>
              ) : (
                <button className="primary-button" onClick={createProject}>LAUNCH AUTOPILOT</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-box">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  return (
    <div className="evidence-card">
      <div className="evidence-topline">
        <span>{item.type}</span>
        <span className={`verification-pill ${statusTone[item.verification as VerificationStatus]}`}>{item.verification}</span>
      </div>
      <div className="evidence-title">{item.description}</div>
      <div className="muted">{item.filePath ?? 'No path'} · {new Date(item.timestamp).toLocaleString()}</div>
    </div>
  );
}

export default App;
