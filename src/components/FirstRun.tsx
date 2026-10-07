import { useState } from 'react';
import { AppConfig, saveConfig } from '../lib/storage';

interface FirstRunProps {
  onComplete: (config: AppConfig) => void;
}

export function FirstRun({ onComplete }: FirstRunProps) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<AppConfig>({
    workspaceRoot: '',
    aiProvider: 'openai',
    modelName: 'gpt-4o-mini',
    autonomyMode: 'STANDARD',
    setupComplete: false
  });
  const [apiKey, setApiKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error' | 'invalid'>('idle');

  const steps = [
    {
      title: 'Welcome to Project Autopilot',
      description: 'Autonomous engineering assistant. Let\'s get you started.',
      content: (
        <div className="review-box">
          <div>Project Autopilot helps you build, test, and deploy projects autonomously.</div>
          <div style={{ marginTop: '12px' }}>Features:</div>
          <div style={{ marginLeft: '12px', marginTop: '8px' }}>
            • Real workspace access and file editing
            • Autonomous task execution with verification
            • Milestone tracking and evidence capture
            • Terminal integration with actual execution
          </div>
        </div>
      )
    },
    {
      title: 'AI Provider',
      description: 'Select and configure your AI provider',
      content: (
        <>
          <label>
            Provider
            <select
              value={config.aiProvider}
              onChange={(e) => {
                const provider = e.target.value as 'openai' | 'anthropic' | 'local';
                const models: Record<string, string> = {
                  openai: 'gpt-4o-mini',
                  anthropic: 'claude-3-5-sonnet-20241022',
                  local: 'local-model'
                };
                setConfig({ ...config, aiProvider: provider, modelName: models[provider] });
              }}
            >
              <option value="openai">OpenAI (GPT-4o, GPT-3.5)</option>
              <option value="anthropic">Anthropic (Claude 3.5)</option>
              <option value="local">Local Model</option>
            </select>
          </label>
          {config.aiProvider !== 'local' && (
            <label>
              API Key
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... or sk-ant-..."
              />
            </label>
          )}
        </>
      )
    },
    {
      title: 'Autonomy Level',
      description: 'How much freedom should the agent have?',
      content: (
        <label>
          Autonomy Mode
          <select
            value={config.autonomyMode}
            onChange={(e) => setConfig({ ...config, autonomyMode: e.target.value as any })}
          >
            <option value="SUPERVISED">SUPERVISED - Ask before each significant action</option>
            <option value="STANDARD">STANDARD - Autonomous with safety checks</option>
            <option value="AUTONOMOUS">AUTONOMOUS - Minimal intervention</option>
          </select>
        </label>
      )
    },
    {
      title: 'Configuration Complete',
      description: 'You\'re ready to launch Project Autopilot',
      content: (
        <div className="review-box">
          <div><strong>Provider:</strong> {config.aiProvider}</div>
          <div><strong>Model:</strong> {config.modelName}</div>
          <div><strong>Autonomy:</strong> {config.autonomyMode}</div>
          <div style={{ marginTop: '12px', color: '#baf0dc' }}>✓ Ready to create your first project</div>
        </div>
      )
    }
  ];

  const handleNext = async () => {
    if (step === 1 && apiKey && config.aiProvider !== 'local') {
      // Test connection
      setTestingConnection(true);
      setConnectionStatus('idle');
      try {
        const response = await fetch('/api/test-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: config.aiProvider,
            apiKey: apiKey,
            model: config.modelName
          })
        });
        if (response.ok) {
          setConnectionStatus('success');
          // Store API key securely (in real app, would be server-side)
          localStorage.setItem(`${config.aiProvider}_key`, apiKey);
          setApiKey('');
          setStep(step + 1);
        } else {
          setConnectionStatus('error');
        }
      } catch {
        setConnectionStatus('error');
      } finally {
        setTestingConnection(false);
      }
    } else if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      const finalConfig = { ...config, setupComplete: true };
      saveConfig(finalConfig);
      onComplete(finalConfig);
    }
  };

  const currentStep = steps[step];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0c1117 0%, #0f1820 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'rgba(12, 17, 23, 0.92)',
        border: '1px solid rgba(148, 163, 184, 0.22)',
        borderRadius: '18px',
        padding: '40px'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{currentStep.title}</h1>
          <p style={{ color: '#9aa9b8', marginBottom: '24px' }}>{currentStep.description}</p>
          <div style={{
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            color: '#6b7b8b',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            Step {step + 1} of {steps.length}
          </div>
          <div style={{
            height: '2px',
            background: '#1a2530',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${((step + 1) / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, #1d6fe5 0%, #7d9cff 100%)',
              transition: 'width 300ms ease'
            }} />
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          {currentStep.content}
        </div>

        {step === 1 && apiKey && config.aiProvider !== 'local' && (
          <div style={{
            marginBottom: '20px',
            padding: '12px',
            borderRadius: '8px',
            background: connectionStatus === 'success' ? 'rgba(62, 207, 157, 0.15)' : connectionStatus === 'error' ? 'rgba(255, 107, 107, 0.13)' : 'rgba(122, 142, 166, 0.12)',
            borderColor: connectionStatus === 'success' ? 'rgba(62, 207, 157, 0.22)' : connectionStatus === 'error' ? 'rgba(255, 107, 107, 0.3)' : 'rgba(122, 142, 166, 0.25)',
            border: '1px solid',
            color: connectionStatus === 'success' ? '#baf0dc' : connectionStatus === 'error' ? '#ffb9b9' : '#dfe9f6'
          }}>
            {testingConnection && 'Testing connection...'}
            {connectionStatus === 'success' && '✓ Connection successful'}
            {connectionStatus === 'error' && '✗ Connection failed. Check your API key.'}
            {connectionStatus === 'invalid' && '✗ Invalid API key format'}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            disabled={step === 0}
            onClick={() => setStep(Math.max(0, step - 1))}
            style={{
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: '10px',
              padding: '9px 12px',
              color: '#edf3ff',
              background: 'rgba(255, 255, 255, 0.01)',
              cursor: 'pointer',
              opacity: step === 0 ? 0.5 : 1
            }}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={testingConnection || (step === 1 && !apiKey && config.aiProvider !== 'local')}
            style={{
              background: 'linear-gradient(135deg, #1d6fe5 0%, #7d9cff 100%)',
              border: 'none',
              color: 'white',
              borderRadius: '10px',
              padding: '9px 12px',
              cursor: 'pointer',
              boxShadow: '0 10px 16px rgba(77, 127, 255, 0.28)',
              opacity: testingConnection || (step === 1 && !apiKey && config.aiProvider !== 'local') ? 0.6 : 1
            }}
          >
            {step === steps.length - 1 ? 'LAUNCH AUTOPILOT' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
