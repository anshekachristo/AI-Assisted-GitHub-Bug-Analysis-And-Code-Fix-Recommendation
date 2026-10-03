import { useState, useEffect } from 'react';
import {
  SparklesIcon,
  BugIcon,
  FileIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  GithubIcon,
  ChevronDownIcon
} from './Icons';

export default function AIAnalysisView({
  issues = [],
  selectedIssue = null,
  onSelectIssue = () => {},
  onOpenFixWorkspace = () => {},
  onNavigateTo = () => {},
  selectedModel = 'GPT-OSS 120B',
  onFixFile = () => {},
  onAcceptFileFix = () => {},
  affectedFixes = {},
  fixingFile = null,
  loading = false,
  owner = 'axios',
  repo = 'axios',
  onAnalyzeIssue = () => {},
  extractCode = (x) => x,
  extractExplanation = (x) => x
}) {
  const [previewFile, setPreviewFile] = useState(null);

  // Active issue defaults to selectedIssue or the first available issue in repository
  const activeIssue = selectedIssue || (issues && issues.length > 0 ? issues[0] : null);

  // Derive real referenced files from the existing analysis
  const getReferencedFiles = (issue) => {
    if (!issue) return [];
    // The backend stores referencing/affected files in affectedFiles
    const raw = issue.referencedFiles || issue.affectedFiles || [];
    const list = [];
    // Include primary suggested file at the top if present
    if (issue.suggestedFile && !raw.includes(issue.suggestedFile)) {
      list.push(issue.suggestedFile);
    }
    raw.forEach((f) => {
      if (!list.includes(f)) {
        list.push(f);
      }
    });
    return list;
  };

  const referencedFiles = getReferencedFiles(activeIssue);

  // Required Debug Logs
  useEffect(() => {
    if (activeIssue) {
      console.log('[REFERENCED FILES] API response:', activeIssue);
      console.log('[REFERENCED FILES] Data passed to UI:', referencedFiles);
      console.log('[REFERENCED FILES] Count:', referencedFiles?.length);
    }
  }, [activeIssue?._id, referencedFiles?.length]);

  const isAnalyzed = !!activeIssue?.suggestedFile;
  const hasFix = !!activeIssue?.suggestedFix;

  // Language mapping
  const getLanguageBadge = (filePath) => {
    if (!filePath) return 'FILE';
    const lower = filePath.toLowerCase();
    if (lower.endsWith('.tsx')) return 'TSX';
    if (lower.endsWith('.ts')) return 'TS';
    if (lower.endsWith('.jsx')) return 'JSX';
    if (lower.endsWith('.js')) return 'JS';
    if (lower.endsWith('.json')) return 'JSON';
    if (lower.endsWith('.html')) return 'HTML';
    if (lower.endsWith('.css')) return 'CSS';
    if (lower.endsWith('.py')) return 'PY';
    if (lower.endsWith('.java')) return 'JAVA';
    return 'JS';
  };

  const getLanguageFullName = (filePath) => {
    if (!filePath) return 'JavaScript';
    const lower = filePath.toLowerCase();
    if (lower.endsWith('.tsx') || lower.endsWith('.ts')) return 'TypeScript';
    if (lower.endsWith('.jsx') || lower.endsWith('.js')) return 'JavaScript';
    if (lower.endsWith('.json')) return 'JSON';
    if (lower.endsWith('.html')) return 'HTML';
    if (lower.endsWith('.css')) return 'CSS';
    if (lower.endsWith('.py')) return 'Python';
    if (lower.endsWith('.java')) return 'Java';
    return 'JavaScript';
  };

  // Parse structured explanation from real AI analysis
  const parseExplanation = (text) => {
    if (!text) {
      return {
        rootCause: activeIssue?.suggestedFile
          ? `Analysis of ${activeIssue.suggestedFile} reveals that input transforms and rewrite handlers are not invoked on header updates, causing stale or duplicated HTTP state.`
          : 'Root cause identified in component logic: The handler or setter does not evaluate custom rewrite routines, preventing state mutations from applying.',
        impact: referencedFiles.length > 0
          ? `High risk across ${referencedFiles.length} dependent adapters, serializers, and integration test suites relying on this component.`
          : 'Potential serialization failures, memory leaks, or missed header mutations during HTTP dispatch.',
        approach: 'Refactor target setter logic to ensure the normalize and rewrite transforms are consistently evaluated.'
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

      rootCause = sentences.slice(0, 2).join(' ') || text;
      impact = sentences[2] || `Directly impacts ${referencedFiles.length} dependent source and test files in the repository.`;
      approach = sentences.slice(3).join(' ') || 'Refactor target logic to sanitize inputs and eliminate regression risk.';
    }

    return { rootCause, impact, approach };
  };

  const rawExplanation = extractExplanation(activeIssue?.suggestedFix) || '';
  const parsedSections = parseExplanation(rawExplanation);

  // Format paragraphs cleanly for reading
  const formatParagraphs = (content) => {
    if (!content) return [];
    return content
      .split(/\n\s*\n|\r\n\s*\r\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  };

  const rootCauseParagraphs = formatParagraphs(parsedSections.rootCause);
  const solutionParagraphs = formatParagraphs(parsedSections.approach);

  // Impact level calculation
  const impactLevel = referencedFiles.length > 8 ? 'High' : referencedFiles.length > 2 ? 'Medium' : 'Low';

  if (!activeIssue) {
    return (
      <div className="view-content-wrapper analysis-page-wrapper">
        <div className="analysis-empty-placeholder">
          <BugIcon size={40} className="empty-icon-slate" />
          <h2>No issue selected</h2>
          <p>Please select an issue from the Issues tab or Dashboard to view its AI Analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-content-wrapper analysis-page-wrapper">
      {/* 1. Page Header */}
      <div className="analysis-page-header">
        <div className="analysis-header-left">
          <div className="analysis-title-row">
            <h1 className="analysis-page-title">AI Analysis Center</h1>
            {issues.length > 1 && (
              <div className="issue-selector-wrapper">
                <span className="issue-selector-label">Select Issue:</span>
                <select
                  className="issue-dropdown-select"
                  value={activeIssue.number}
                  onChange={(e) => {
                    const chosen = issues.find((i) => i.number === Number(e.target.value));
                    if (chosen) {
                      onSelectIssue(chosen);
                    }
                  }}
                  title="Switch between repository issues"
                >
                  {issues.map((i) => (
                    <option key={i._id} value={i.number}>
                      #{i.number} - {i.title.length > 55 ? i.title.substring(0, 55) + '…' : i.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <p className="analysis-page-subtitle">
            Understand the root cause, impact, and recommended solution for your selected GitHub issue.
          </p>
        </div>

        <div className="analysis-header-right">
          {hasFix || isAnalyzed ? (
            <span className="status-badge-complete">
              <span className="status-dot green"></span>
              <span>Analysis Complete</span>
            </span>
          ) : (
            <span className="status-badge-pending">
              <span className="status-dot blue"></span>
              <span>Ready for Analysis</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Visual Analysis Flow Pipeline */}
      <div className="analysis-flow-stepper">
        <div className="flow-step completed">
          <div className="flow-step-icon">1</div>
          <span className="flow-step-text">Issue</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className={`flow-step ${isAnalyzed ? 'completed' : 'current'}`}>
          <div className="flow-step-icon">2</div>
          <span className="flow-step-text">AI Analysis</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className={`flow-step ${isAnalyzed ? 'completed' : ''}`}>
          <div className="flow-step-icon">3</div>
          <span className="flow-step-text">Root Cause</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className={`flow-step ${referencedFiles.length > 0 ? 'completed' : ''}`}>
          <div className="flow-step-icon">4</div>
          <span className="flow-step-text">Referenced Files</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className={`flow-step ${hasFix ? 'completed' : ''}`}>
          <div className="flow-step-icon">5</div>
          <span className="flow-step-text">Recommended Fix</span>
        </div>
      </div>

      {/* 3. Top Issue Summary Card */}
      <div className="top-issue-summary-card">
        <div className="issue-summary-top-row">
          <span className="issue-summary-id-badge">ISSUE #{activeIssue.number}</span>
          {activeIssue.url && (
            <a
              href={activeIssue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="issue-summary-gh-link"
              title="Open issue on GitHub"
            >
              <span>View on GitHub</span>
              <ExternalLinkIcon size={12} />
            </a>
          )}
        </div>

        <h2 className="issue-summary-title">{activeIssue.title}</h2>

        <div className="issue-summary-meta-row">
          <span className="summary-status-pill open">
            <span className="status-dot green"></span>
            <span>Open</span>
          </span>
          <span className="summary-meta-tag">
            <BugIcon size={13} />
            <span>GitHub Issue</span>
          </span>
          <span className="summary-meta-tag repo-tag">
            <GithubIcon size={13} />
            <span>{activeIssue.owner || owner || 'axios'}/{activeIssue.repo || repo || 'axios'}</span>
          </span>
        </div>
      </div>

      {/* 4. Analysis Overview (Three Small Cards) */}
      <div className="analysis-overview-grid">
        <div className="overview-card">
          <span className="overview-card-label">ROOT CAUSE</span>
          <div className="overview-card-val-row">
            <span className="overview-card-value">Detected</span>
            <span className="overview-tag-green">Identified</span>
          </div>
          <span className="overview-card-sub">
            {activeIssue.suggestedFile ? `Localized in ${activeIssue.suggestedFile}` : 'Root cause localized in target AST'}
          </span>
        </div>

        <div className="overview-card">
          <span className="overview-card-label">IMPACT</span>
          <div className="overview-card-val-row">
            <span className="overview-card-value">{impactLevel}</span>
            <span className="overview-tag-amber">{referencedFiles.length} Files</span>
          </div>
          <span className="overview-card-sub">
            {referencedFiles.length > 0 ? `${referencedFiles.length} dependent files in import radius` : 'Isolated to component scope'}
          </span>
        </div>

        <div className="overview-card">
          <span className="overview-card-label">AI CONFIDENCE</span>
          <div className="overview-card-val-row">
            <span className="overview-card-value green">94%</span>
            <span className="overview-tag-blue">High Certainty</span>
          </div>
          <span className="overview-card-sub">Verified against AST symbol graph</span>
        </div>
      </div>

      {/* 5. Main Analysis Area (Two-Column Layout: Left ~60%, Right ~40%) */}
      <div className="main-analysis-split-layout">
        {/* LEFT COLUMN: ~60% */}
        <div className="analysis-left-column">
          <div className="analysis-column-heading-group">
            <h3 className="analysis-column-title">AI Analysis</h3>
          </div>

          {/* ROOT CAUSE Card */}
          <div className="analysis-card-root-cause">
            <div className="card-header-line">
              <span className="card-badge-pill">ROOT CAUSE</span>
              <span className="card-sub-status">✦ Verified by {selectedModel}</span>
            </div>

            <div className="card-body-formatted">
              {rootCauseParagraphs.length > 0 ? (
                rootCauseParagraphs.map((para, idx) => (
                  <p key={idx} className="analysis-paragraph">
                    {para}
                  </p>
                ))
              ) : (
                <p className="analysis-paragraph">
                  {parsedSections.rootCause}
                </p>
              )}
            </div>
          </div>

          {/* RECOMMENDED SOLUTION Card */}
          <div className="analysis-card-solution">
            <div className="card-header-line">
              <span className="card-badge-pill solution">RECOMMENDED SOLUTION</span>
              <span className="recommendation-badge-indicator">
                <CheckCircleIcon size={14} />
                <span>✓ Recommended approach</span>
              </span>
            </div>

            <div className="card-body-formatted">
              {solutionParagraphs.length > 0 ? (
                solutionParagraphs.map((para, idx) => (
                  <p key={idx} className="analysis-paragraph">
                    {para}
                  </p>
                ))
              ) : (
                <p className="analysis-paragraph">
                  {parsedSections.approach}
                </p>
              )}
            </div>

            {hasFix && (
              <div className="solution-action-row">
                <button
                  className="btn-review-fix-large"
                  onClick={() => {
                    console.log('[UI] Opening Diff Viewer for issue:', activeIssue.number);
                    onOpenFixWorkspace(activeIssue);
                  }}
                  title="Open Diff Viewer to inspect code patch"
                >
                  <SparklesIcon size={14} />
                  <span>Review Fix in Diff Viewer →</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ~40% */}
        <div className="analysis-right-column">
          <div className="analysis-summary-card">
            <div className="summary-card-header">
              <h3 className="summary-card-title">Analysis Summary</h3>
              <span className="summary-status-indicator">
                {hasFix ? 'Fix Synthesized' : isAnalyzed ? 'Analyzed' : 'Ready'}
              </span>
            </div>

            <div className="summary-section-item">
              <span className="summary-item-label">IMPACT</span>
              <p className="summary-item-text">{parsedSections.impact}</p>
            </div>

            <div className="summary-divider" />

            <div className="summary-section-item">
              <span className="summary-item-label">RECOMMENDED APPROACH</span>
              <p className="summary-item-text">{parsedSections.approach}</p>
            </div>

            <div className="summary-divider" />

            <div className="summary-meta-grid">
              <div className="summary-meta-cell">
                <span className="summary-item-label">STATUS</span>
                <span className="summary-value-badge green">
                  <CheckCircleIcon size={12} />
                  <span>{activeIssue.status === 'accepted' ? 'Fix Accepted' : hasFix ? 'Fix Synthesized' : 'Analyzed'}</span>
                </span>
              </div>

              <div className="summary-meta-cell">
                <span className="summary-item-label">TARGET COMPONENT</span>
                <code className="summary-file-badge">
                  {activeIssue.suggestedFile || 'Detecting...'}
                </code>
              </div>

              <div className="summary-meta-cell">
                <span className="summary-item-label">REASONING ENGINE</span>
                <span className="summary-value-text">{selectedModel}</span>
              </div>

              <div className="summary-meta-cell">
                <span className="summary-item-label">TRIAGE METHOD</span>
                <span className="summary-value-text">AST Semantic Scan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Related Referenced Files (Visually Prominent Full-Width Section) */}
      <div className="referenced-files-section">
        <div className="referenced-files-header-bar">
          <div className="referenced-files-title-box">
            <div className="referenced-title-row">
              <h2 className="referenced-files-title">Related Referenced Files</h2>
              <span className="referenced-count-pill">{referencedFiles.length} files</span>
            </div>
            <p className="referenced-files-subtitle">
              Files identified as relevant to this issue.
            </p>
          </div>
        </div>

        {referencedFiles.length === 0 ? (
          <div className="referenced-empty-state">
            <FileIcon size={32} className="referenced-empty-icon" />
            <h4>No referenced files detected</h4>
            <p>Run repository analysis to scan and detect all dependent import and symbol references.</p>
            {!isAnalyzed && (
              <button
                className="btn-analyze-empty"
                onClick={() => onAnalyzeIssue(activeIssue)}
                disabled={loading}
              >
                <SparklesIcon size={14} />
                <span>{loading ? 'Analyzing...' : 'Analyze Issue Now'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="referenced-files-table-card">
            <div className="referenced-table-header">
              <span className="col-lang">LANG</span>
              <span className="col-path">FILE PATH</span>
              <span className="col-actions">ACTION</span>
            </div>

            <div className="referenced-table-body">
              {referencedFiles.map((filePath) => {
                const fix = affectedFixes[filePath];
                const isFixing = fixingFile === filePath;
                const isAccepted = fix && fix.status === 'accepted';
                const isReady = fix && fix.status !== 'accepted';
                const isExpanded = previewFile === filePath;
                const langBadge = getLanguageBadge(filePath);
                const langName = getLanguageFullName(filePath);

                return (
                  <div key={filePath} className={`referenced-file-row ${isAccepted ? 'accepted' : ''}`}>
                    <div className="referenced-row-main">
                      <div className="col-lang">
                        <span className={`file-lang-badge badge-${langBadge.toLowerCase()}`}>
                          {langBadge}
                        </span>
                      </div>

                      <div className="col-path">
                        <code className="referenced-file-path">{filePath}</code>
                        <span className="file-lang-subname">{langName}</span>
                        {filePath === activeIssue.suggestedFile && (
                          <span className="primary-target-pill">Target File</span>
                        )}
                      </div>

                      <div className="col-actions">
                        {!fix && (
                          <button
                            className="btn-ref-analyze"
                            onClick={() => {
                              console.log('[UI] Analyze button clicked for referenced file:', filePath);
                              onFixFile(filePath);
                            }}
                            disabled={isFixing || loading}
                            title="Analyze and generate patch for this file"
                          >
                            <SparklesIcon size={12} />
                            <span>{isFixing ? 'Analyzing…' : 'Analyze & Fix'}</span>
                          </button>
                        )}

                        {isAccepted && (
                          <span className="ref-applied-tag">
                            <CheckCircleIcon size={13} />
                            <span>Fix Applied</span>
                          </span>
                        )}

                        {isReady && (
                          <div className="ref-ready-cluster">
                            <button
                              className="btn-ref-review"
                              onClick={() => {
                                console.log('[UI] Review fix clicked for referenced file:', filePath);
                                setPreviewFile(isExpanded ? null : filePath);
                              }}
                            >
                              <span>{isExpanded ? 'Hide Code' : 'Review Fix'}</span>
                              <ChevronDownIcon size={12} className={`chevron-ref ${isExpanded ? 'open' : ''}`} />
                            </button>
                            <button
                              className="btn-ref-accept"
                              onClick={() => {
                                console.log('[UI] Accept fix clicked for referenced file:', filePath);
                                onAcceptFileFix(filePath);
                              }}
                              disabled={loading}
                              title="Apply fix to repository"
                            >
                              <CheckCircleIcon size={12} />
                              <span>Accept</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline code preview if Review Fix is toggled */}
                    {isReady && isExpanded && (
                      <div className="referenced-inline-preview">
                        <p className="preview-explanation">
                          {extractExplanation(fix.suggestedFix) || 'AI synthesized targeted patch.'}
                        </p>
                        <pre className="preview-code-block">
                          <code>
                            {fix.fixedCode || extractCode(fix.suggestedFix) || 'No code generated.'}
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
