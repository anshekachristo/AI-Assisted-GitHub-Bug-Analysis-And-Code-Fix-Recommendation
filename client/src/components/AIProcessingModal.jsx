import { useEffect, useState } from 'react';
import { SparklesIcon, CheckCircleIcon, CpuIcon } from './Icons';

export default function AIProcessingModal({
  isOpen = false,
  statusMessage = 'Analyzing codebase with AI...',
  modelName = 'GPT-OSS 120B'
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    'Synchronizing repository with local environment',
    'Scanning Abstract Syntax Tree (AST) & impact graph',
    'Evaluating issue description & reproduction criteria',
    'Isolating culprit module & root cause',
    'Synthesizing verified fix patch',
    'Preparing side-by-side diff'
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [isOpen, steps.length]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay">
      <div className="processing-card" role="dialog" aria-modal="true">
        <div className="processing-header">
          <div className="ai-core-icon">
            <SparklesIcon size={24} className="sparkle-spin" />
          </div>
          <div className="processing-meta">
            <div className="engine-meta-row">
              <span className="engine-title-chip">✦ AI CODE INTELLIGENCE</span>
              <span className="engine-model-chip">{modelName}</span>
            </div>
            <h3 className="processing-title">{statusMessage}</h3>
          </div>
        </div>

        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(
                100,
                Math.round(((currentStepIndex + 1) / steps.length) * 100)
              )}%`
            }}
          ></div>
        </div>

        <div className="steps-list">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step}
                className={`step-row ${isCompleted ? 'completed' : ''} ${
                  isCurrent ? 'active' : ''
                }`}
              >
                <div className="step-indicator">
                  {isCompleted ? (
                    <CheckCircleIcon size={14} className="check-svg" />
                  ) : isCurrent ? (
                    <span className="active-dot-pulsing"></span>
                  ) : (
                    <span className="idle-dot-circle"></span>
                  )}
                </div>
                <span className="step-label-text">{step}</span>
              </div>
            );
          })}
        </div>

        <div className="processing-bottom-tip">
          <CpuIcon size={14} />
          <span>Autonomous LLM inference running with AST verification</span>
        </div>
      </div>
    </div>
  );
}
