import {
  SparklesIcon,
  BugIcon,
  CodeIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from './Icons';

export default function WorkflowPipeline({
  hasSelectedIssue = false,
  hasAnalyzed = false,
  hasFix = false,
  isAccepted = false
}) {
  const steps = [
    {
      id: 1,
      label: 'GitHub Issue',
      desc: 'Ingest bug report',
      icon: BugIcon,
      active: hasSelectedIssue,
      done: hasAnalyzed || hasFix
    },
    {
      id: 2,
      label: 'AI Locate & Scan',
      desc: 'Pinpoint faulty module',
      icon: SparklesIcon,
      active: hasAnalyzed,
      done: hasAnalyzed
    },
    {
      id: 3,
      label: 'Root Cause & Impact',
      desc: 'Analyze dependency tree',
      icon: BugIcon,
      active: hasAnalyzed,
      done: hasFix
    },
    {
      id: 4,
      label: 'AI Fix Synthesis',
      desc: 'Generate complete code',
      icon: CodeIcon,
      active: hasFix,
      done: hasFix
    },
    {
      id: 5,
      label: 'Diff Review & Apply',
      desc: 'Verify & merge into repo',
      icon: CheckCircleIcon,
      active: hasFix,
      done: isAccepted
    }
  ];

  return (
    <div className="lifecycle-pipeline-card">
      <div className="pipeline-header-row">
        <div className="pipeline-title-group">
          <span className="pipeline-chip">AUTONOMOUS PIPELINE</span>
          <h3 className="pipeline-heading">Engine Execution Lifecycle</h3>
        </div>
        <span className="pipeline-status-badge">
          {isAccepted
            ? '✓ Fix Applied to Repository'
            : hasFix
            ? '● Ready for Review'
            : hasAnalyzed
            ? '✦ Analysis Completed'
            : hasSelectedIssue
            ? '● Issue Queued'
            : '○ Awaiting Issue Selection'}
        </span>
      </div>

      <div className="pipeline-track">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = step.active && !step.done;

          return (
            <div key={step.id} className="pipeline-step-segment">
              <div
                className={`pipeline-step-box ${step.done ? 'done' : ''} ${
                  isCurrent ? 'current' : ''
                } ${!step.active && !step.done ? 'idle' : ''}`}
              >
                <div className="step-badge-number">
                  {step.done ? '✓' : `0${step.id}`}
                </div>
                <div className="step-info">
                  <div className="step-info-top">
                    <Icon size={14} className="step-icon-svg" />
                    <span className="step-name">{step.label}</span>
                  </div>
                  <span className="step-caption">{step.desc}</span>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className={`pipeline-arrow-separator ${step.done ? 'done' : ''}`}>
                  <ArrowRightIcon size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
