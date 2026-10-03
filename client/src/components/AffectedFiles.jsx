import { useState } from 'react';
import {
  FileIcon,
  SparklesIcon,
  CheckCircleIcon,
  CodeIcon,
  ChevronDownIcon
} from './Icons';

export default function AffectedFiles({
  affectedFiles = [],
  affectedFixes = {},
  onFixFile = () => {},
  onAcceptFileFix = () => {},
  fixingFile = null,
  loading = false,
  extractCode = (x) => x,
  extractExplanation = (x) => x
}) {
  const [expandedFile, setExpandedFile] = useState(null);

  if (!affectedFiles || affectedFiles.length === 0) {
    return null;
  }

  const getLanguageFromPath = (path) => {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'TypeScript';
    if (path.endsWith('.jsx') || path.endsWith('.js')) return 'JavaScript';
    if (path.endsWith('.json')) return 'JSON';
    if (path.endsWith('.html')) return 'HTML';
    if (path.endsWith('.css')) return 'CSS';
    return 'JavaScript';
  };

  return (
    <div className="affected-files-section-card">
      <div className="affected-header-row">
        <div className="affected-title-group">
          <FileIcon size={16} className="affected-icon" />
          <h3 className="affected-section-title">Affected Dependent Files</h3>
        </div>
        <span className="affected-count-tag">{affectedFiles.length} files</span>
      </div>

      <div className="affected-list-grid">
        {affectedFiles.map((filePath) => {
          const fix = affectedFixes[filePath];
          const isFixing = fixingFile === filePath;
          const isAccepted = fix && fix.status === 'accepted';
          const isReady = fix && fix.status !== 'accepted';
          const isExpanded = expandedFile === filePath;

          return (
            <div
              key={filePath}
              className={`affected-row-item ${isAccepted ? 'accepted' : ''}`}
            >
              <div className="affected-row-header">
                <div className="file-info-group">
                  <span className="file-check-dot">✓</span>
                  <code className="file-path-code">{filePath}</code>
                  <span className="file-lang-pill">{getLanguageFromPath(filePath)}</span>
                </div>

                <div className="file-actions-cluster">
                  {!fix && (
                    <button
                      className="btn-file-analyze"
                      onClick={() => {
                        console.log('[UI] Analyze & Fix clicked for file:', filePath);
                        onFixFile(filePath);
                      }}
                      disabled={isFixing || loading}
                      title="Generate targeted fix for this file"
                    >
                      <SparklesIcon size={12} />
                      <span>{isFixing ? 'Analyzing…' : 'Analyze & Fix'}</span>
                    </button>
                  )}

                  {isAccepted && (
                    <span className="badge-applied-pill">
                      <CheckCircleIcon size={12} />
                      <span>Fix Applied</span>
                    </span>
                  )}

                  {isReady && (
                    <div className="file-ready-actions">
                      <button
                        className="btn-file-review"
                        onClick={() => {
                          console.log('[UI] Review Fix clicked for file:', filePath);
                          setExpandedFile(isExpanded ? null : filePath);
                        }}
                      >
                        <span>{isExpanded ? 'Hide Code' : 'Review Fix'}</span>
                        <ChevronDownIcon size={12} className={`chevron ${isExpanded ? 'open' : ''}`} />
                      </button>
                      <button
                        className="btn-file-accept"
                        onClick={() => {
                          console.log('[UI] Accept file fix clicked for:', filePath);
                          onAcceptFileFix(filePath);
                        }}
                        disabled={loading}
                      >
                        <CheckCircleIcon size={12} />
                        <span>Accept</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isReady && isExpanded && (
                <div className="affected-inline-preview">
                  <p className="preview-explanation-text">
                    {extractExplanation(fix.suggestedFix) || 'AI synthesized targeted patch.'}
                  </p>
                  <pre className="preview-code-dark">
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
  );
}
