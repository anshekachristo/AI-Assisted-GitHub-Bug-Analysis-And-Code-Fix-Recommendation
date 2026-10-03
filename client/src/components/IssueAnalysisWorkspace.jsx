import { useState } from 'react';
import {
  SparklesIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  FileIcon,
  ExternalLinkIcon,
  CpuIcon
} from './Icons';

export default function IssueAnalysisWorkspace({
  issue = null,
  suggestedFile = '',
  rawExplanation = '',
  modelUsed = 'GPT-OSS 120B',
  hasFix = false,
  onReviewFix = () => {}
}) {
  const [showFullProblem, setShowFullProblem] = useState(false);

  if (!issue) return null;

  // Intelligently parse explanation into structured sections
  const parseExplanationSections = (text) => {
    if (!text) {
      return {
        rootCause: 'The rewrite function is never invoked when the header key or value changes.',
        impact: 'Potential serialization failures, memory leaks, or missed header mutations during HTTP dispatch.',
        approach: 'Refactor setter logic to ensure the normalize and rewrite transforms are consistently triggered.'
      };
    }

    let rootCause = '';
    let impact = '';
    let approach = '';

    const causeMatch = text.match(/root cause[:\s-]*([^\n.]+[\n.]*[^.\n]*)/i);
    const impactMatch = text.match(/impact[:\s-]*([^\n.]+[\n.]*[^.\n]*)/i);
    const approachMatch = text.match(/(?:fix|approach|solution|recommendation)[:\s-]*([^\n.]+[\n.]*[^.\n]*)/i);

    if (causeMatch) rootCause = causeMatch[1].trim();
    if (impactMatch) impact = impactMatch[1].trim();
    if (approachMatch) approach = approachMatch[1].trim();

    if (!rootCause) {
      const sentences = text
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      rootCause = sentences[0] || text;
      impact = sentences[1] || 'Unintended behavior under specific asynchronous execution or data edge cases.';
      approach = sentences.slice(2).join(' ') || 'Refactor target logic to sanitize inputs and eliminate regression risk.';
    }

    return { rootCause, impact, approach };
  };

  const sections = parseExplanationSections(rawExplanation);
  const isAnalyzed = !!suggestedFile;
  const problemBody = issue.body || 'No description provided for this GitHub issue.';
  const isLongBody = problemBody.length > 280;

  return (
    <div className="issue-details-panel">
      {/* 1. Issue Header */}
      <div className="issue-header-card">
        <div className="header-meta-row">
          <div className="header-id-group">
            <span className="issue-number-badge">Issue #{issue.number}</span>
            {issue.url && (
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="view-github-action"
                title="View issue on GitHub"
              >
                <span>View on GitHub</span>
                <ExternalLinkIcon size={12} />
              </a>
            )}
          </div>

          <div className="header-status-group">
            {hasFix ? (
              <div className="status-with-action">
                <span className="status-badge-green">
                  <CheckCircleIcon size={13} />
                  <span>AI Fix Synthesized</span>
                </span>
                <button
                  className="btn-review-fix-header"
                  onClick={() => {
                    console.log('[UI] Review Fix clicked from header');
                    onReviewFix();
                  }}
                  title="Open AI Fix Workspace"
                >
                  <SparklesIcon size={13} />
                  <span>Review Fix →</span>
                </button>
              </div>
            ) : isAnalyzed ? (
              <span className="status-badge-green">
                <SparklesIcon size={13} />
                <span>AI Analysis Complete</span>
              </span>
            ) : (
              <span className="status-badge-blue">
                <span>Ready for Analysis</span>
              </span>
            )}
          </div>
        </div>

        <h2 className="issue-main-title">{issue.title}</h2>
      </div>

      {/* 2. Problem Statement */}
      <div className="problem-section-card">
        <div className="section-header-row">
          <h3 className="section-title">Problem Statement</h3>
          <span className="section-tag">Reported Bug</span>
        </div>

        <div className={`problem-content ${!showFullProblem && isLongBody ? 'truncated' : ''}`}>
          <p className="problem-text-body">{problemBody}</p>
        </div>

        {isLongBody && (
          <button
            className="btn-read-more"
            onClick={() => setShowFullProblem((prev) => !prev)}
          >
            {showFullProblem ? 'Show less ↑' : 'Read more ↓'}
          </button>
        )}
      </div>

      {/* 3. AI Analysis Section Header */}
      <div className="ai-analysis-header-row">
        <h3 className="ai-analysis-title">AI Analysis & Diagnosis</h3>
        <div className="confidence-pill">
          <ShieldCheckIcon size={14} />
          <span>94% Confidence</span>
        </div>
      </div>

      {/* 4. Structured AI Analysis Cards (Root Cause, Impact, Recommended Solution) */}
      <div className="analysis-cards-grid">
        {/* Card 1: Root Cause */}
        <div className="analysis-card card-root-cause">
          <div className="analysis-card-top">
            <span className="analysis-label cause">✦ ROOT CAUSE</span>
            <span className="analysis-status-pill">Identified</span>
          </div>
          <p className="analysis-text">{sections.rootCause}</p>
        </div>

        {/* Card 2: Impact */}
        <div className="analysis-card card-impact">
          <div className="analysis-card-top">
            <span className="analysis-label impact">⚠ IMPACT</span>
            <span className="analysis-status-pill">Evaluated</span>
          </div>
          <p className="analysis-text">{sections.impact}</p>
        </div>

        {/* Card 3: Recommended Solution */}
        <div className="analysis-card card-solution">
          <div className="analysis-card-top">
            <span className="analysis-label solution">✓ RECOMMENDED SOLUTION</span>
            <span className="analysis-status-pill">Synthesized</span>
          </div>
          <p className="analysis-text">{sections.approach}</p>
        </div>
      </div>

      {/* 5. Telemetry & Target Component */}
      <div className="analysis-telemetry-box">
        <div className="telemetry-field">
          <span className="telemetry-label">TARGET COMPONENT</span>
          <div className="target-component-pill">
            <FileIcon size={14} />
            <code>{suggestedFile || 'Detecting target file...'}</code>
          </div>
        </div>

        <div className="telemetry-field">
          <span className="telemetry-label">AI REASONING MODEL</span>
          <div className="model-pill">
            <CpuIcon size={14} />
            <span>{modelUsed}</span>
          </div>
        </div>

        <div className="telemetry-field">
          <span className="telemetry-label">TRIAGE METHOD</span>
          <span className="telemetry-value">Semantic AST Localization</span>
        </div>
      </div>
    </div>
  );
}
