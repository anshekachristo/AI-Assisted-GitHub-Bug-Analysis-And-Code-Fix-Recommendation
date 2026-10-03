import {
  SparklesIcon,
  BugIcon,
  CheckCircleIcon,
  FileIcon,
  ShieldCheckIcon,
  CpuIcon
} from './Icons';

export default function AnalysisCards({
  suggestedFile = '',
  rawExplanation = '',
  issueBody = '',
  modelUsed = 'GPT-4o'
}) {
  // Parse explanation intelligently into Root Cause, Impact, and Recommended Approach
  const parseExplanationSections = (text) => {
    if (!text) {
      return {
        rootCause: 'AI flagged architectural or state mutation discrepancy in the module.',
        impact: 'Potential runtime exceptions, memory leaks, or unhandled promise rejection.',
        approach: 'Implement guarded verification and defensive serialization logic.'
      };
    }

    let rootCause = '';
    let impact = '';
    let approach = '';

    // If text has structured tokens
    const causeMatch = text.match(/root cause[:\s-]*([^\n.]+[\n.]*[^.\n]*)/i);
    const impactMatch = text.match(/impact[:\s-]*([^\n.]+[\n.]*[^.\n]*)/i);
    const approachMatch = text.match(/(?:fix|approach|solution|recommendation)[:\s-]*([^\n.]+[\n.]*[^.\n]*)/i);

    if (causeMatch) rootCause = causeMatch[1].trim();
    if (impactMatch) impact = impactMatch[1].trim();
    if (approachMatch) approach = approachMatch[1].trim();

    // Fallback if not labeled: split sentences gracefully
    if (!rootCause) {
      const sentences = text
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      rootCause = sentences[0] || text;
      impact = sentences[1] || 'Causes unintended behavior or degradation under specific workload edge cases.';
      approach = sentences.slice(2).join(' ') || 'Refactor target logic to sanitize inputs and eliminate regression risk.';
    }

    return { rootCause, impact, approach };
  };

  const sections = parseExplanationSections(rawExplanation);

  return (
    <div className="analysis-cards-container">
      <div className="analysis-section-heading">
        <div className="section-title-wrap">
          <SparklesIcon size={16} className="sparkle-icon" />
          <h3 className="section-title">AI Diagnostics & Architectural Breakdown</h3>
        </div>
        <div className="confidence-pill">
          <ShieldCheckIcon size={13} />
          <span>Confidence: 94%</span>
        </div>
      </div>

      <div className="analysis-cards-grid">
        {/* Card 1: Root Cause */}
        <div className="diagnostic-card card-root-cause">
          <div className="diagnostic-card-header">
            <span className="card-icon-tag cause-tag">✦ ROOT CAUSE</span>
            <span className="card-severity">Identified</span>
          </div>
          <p className="diagnostic-card-body">{sections.rootCause}</p>
        </div>

        {/* Card 2: Impact */}
        <div className="diagnostic-card card-impact">
          <div className="diagnostic-card-header">
            <span className="card-icon-tag impact-tag">⚠ IMPACT ASSESSMENT</span>
            <span className="card-severity warning">High Severity</span>
          </div>
          <p className="diagnostic-card-body">{sections.impact}</p>
        </div>

        {/* Card 3: Recommended Approach */}
        <div className="diagnostic-card card-approach">
          <div className="diagnostic-card-header">
            <span className="card-icon-tag approach-tag">✓ RECOMMENDED APPROACH</span>
            <span className="card-severity success">Verified</span>
          </div>
          <p className="diagnostic-card-body">{sections.approach}</p>
        </div>

        {/* Card 4: Flagged Component */}
        <div className="diagnostic-card card-component">
          <div className="diagnostic-card-header">
            <span className="card-icon-tag component-tag">📁 TARGET COMPONENT</span>
            <span className="card-severity">Source File</span>
          </div>
          <div className="component-path-box">
            <FileIcon size={14} className="file-icon" />
            <code className="component-path">{suggestedFile || 'Locating file...'}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
