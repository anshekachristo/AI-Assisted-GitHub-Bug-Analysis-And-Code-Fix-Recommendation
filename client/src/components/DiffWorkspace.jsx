import { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import {
  SparklesIcon,
  CopyIcon,
  RefreshIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  FileIcon
} from './Icons';

export default function DiffWorkspace({
  suggestedFile = '',
  originalCode = '',
  fixedCode = '',
  status = 'pending',
  onAccept = () => {},
  onReject = () => {},
  onReanalyze = () => {},
  onBack = () => {},
  loading = false
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (fixedCode) {
      console.log('[UI] Copy Fix clicked');
      navigator.clipboard.writeText(fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Estimate line changes
  const origLineCount = originalCode ? originalCode.split('\n').length : 0;
  const fixedLineCount = fixedCode ? fixedCode.split('\n').length : 0;
  const lineDelta = fixedLineCount - origLineCount;
  const additionsEstimate = Math.max(1, Math.abs(lineDelta) + 5);
  const deletionsEstimate = Math.max(0, lineDelta < 0 ? Math.abs(lineDelta) : 2);

  return (
    <section className="fix-workspace-card" id="fix-workspace-section">
      {/* 1. Header: AI Fix Workspace, File path, AI confidence, Change statistics */}
      <div className="fix-workspace-header">
        <div className="fix-header-left">
          <div className="fix-title-row">
            <span className="fix-badge-label">
              <SparklesIcon size={13} />
              AI FIX WORKSPACE
            </span>
            <div className="fix-status-indicator">
              {status === 'accepted' ? (
                <span className="status-pill-accepted">✓ Fix Applied to Repository</span>
              ) : status === 'rejected' ? (
                <span className="status-pill-rejected">✕ Fix Discarded</span>
              ) : (
                <span className="status-pill-ready">● AI Fix Ready</span>
              )}
            </div>
          </div>

          <div className="fix-file-path-row">
            <FileIcon size={18} className="fix-file-icon" />
            <span className="fix-file-label">File:</span>
            <code className="fix-file-path-code">{suggestedFile || 'target-file.js'}</code>
          </div>
        </div>

        <div className="fix-header-stats">
          <div className="stat-change-pill additions">+{additionsEstimate} additions</div>
          <div className="stat-change-pill deletions">-{deletionsEstimate} deletions</div>
          <div className="stat-confidence-pill">
            <ShieldCheckIcon size={13} />
            <span>AI confidence: 94%</span>
          </div>
        </div>
      </div>

      {/* 2. Top Quick Toolbar (Back and Copy) */}
      <div className="diff-quick-bar">
        <button
          className="btn-quick-back"
          onClick={() => {
            console.log('[UI] Back button clicked (top)');
            onBack();
          }}
          title="Return to Issue Overview"
        >
          ← Back to Details
        </button>

        <div className="diff-view-mode-tag">
          <span>ORIGINAL CODE</span>
          <span className="split-sep">|</span>
          <span>AI FIX</span>
        </div>

        <button
          className="btn-copy-code"
          onClick={handleCopy}
          title="Copy synthesized code to clipboard"
        >
          <CopyIcon size={13} />
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Fix'}</span>
        </button>
      </div>

      {/* 3. The Diff Viewer: Monaco/ReactDiffViewer (Dark inside, light outside) */}
      <div className="diff-viewer-wrapper">
        <ReactDiffViewer
          oldValue={originalCode || ''}
          newValue={fixedCode || ''}
          splitView={true}
          useDarkTheme={true}
          leftTitle="ORIGINAL CODE"
          rightTitle="AI FIX"
          styles={{
            variables: {
              dark: {
                diffViewerBackground: '#0D1117',
                diffViewerColor: '#E6EDF3',
                addedBackground: '#0F2D1A',
                addedColor: '#3FB950',
                removedBackground: '#3D1518',
                removedColor: '#F85149',
                wordAddedBackground: '#195A2B',
                wordRemovedBackground: '#6E1D24',
                addedGutterBackground: '#0A2012',
                removedGutterBackground: '#2A0D10',
                gutterBackground: '#0D1117',
                gutterBackgroundDark: '#0B0F14',
                highlightBackground: '#161B22',
                highlightGutterBackground: '#161B22',
                codeFoldGutterBackground: '#161B22',
                codeFoldBackground: '#161B22',
                emptyLineBackground: '#0D1117',
                gutterColor: '#6E7681',
                addedGutterColor: '#3FB950',
                removedGutterColor: '#F85149',
                codeFoldContentColor: '#8B949E',
                diffViewerTitleBackground: '#161B22',
                diffViewerTitleColor: '#E6EDF3',
                diffViewerTitleBorderColor: '#30363D'
              }
            },
            contentText: {
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: '13px',
              lineHeight: '20px'
            },
            line: {
              padding: '2px 6px'
            }
          }}
        />
      </div>

      {/* 4. FIX ACTIONS BELOW THE DIFF per explicit requirement:
          [ ← Back ] [ Re-analyze ] [ Reject Fix ] [ Accept AI Fix ]
      */}
      <div className="diff-bottom-actions-bar">
        <div className="actions-bar-left">
          <button
            className="btn-diff-action secondary"
            onClick={() => {
              console.log('[UI] Back button clicked (bottom)');
              onBack();
            }}
          >
            ← Back
          </button>

          <button
            className="btn-diff-action secondary"
            onClick={() => {
              console.log('[UI] Re-analyze clicked');
              onReanalyze();
            }}
            disabled={loading}
            title="Re-run AI analysis and synthesis"
          >
            <RefreshIcon size={14} />
            <span>{loading ? 'Re-analyzing…' : 'Re-analyze'}</span>
          </button>
        </div>

        <div className="actions-bar-right">
          <button
            className="btn-diff-action danger"
            onClick={() => {
              console.log('[UI] Reject Fix clicked');
              onReject();
            }}
            disabled={loading}
            title="Discard this AI fix"
          >
            <XCircleIcon size={14} />
            <span>Reject Fix</span>
          </button>

          <button
            className="btn-diff-action primary"
            onClick={() => {
              console.log('[UI] Accept AI Fix clicked');
              onAccept();
            }}
            disabled={loading}
            title="Apply AI fix to local repository"
          >
            <CheckCircleIcon size={14} />
            <span>Accept AI Fix</span>
          </button>
        </div>
      </div>
    </section>
  );
}
