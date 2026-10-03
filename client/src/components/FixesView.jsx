import { CodeIcon, SparklesIcon, CheckCircleIcon, XCircleIcon, FileIcon } from './Icons';

export default function FixesView({
  issues = [],
  onSelectIssue = () => {},
  onOpenFixWorkspace = () => {},
  onNavigateTo = () => {}
}) {
  const fixesIssues = issues.filter((i) => i.suggestedFix);

  const handleInspect = (issue) => {
    console.log('[UI] FixesView: inspecting fix for issue', issue.number);
    onSelectIssue(issue);
    onOpenFixWorkspace(issue);
    onNavigateTo('Dashboard');
  };

  return (
    <div className="view-content-wrapper fixes-page">
      <div className="view-page-header">
        <div>
          <h1 className="view-page-title">AI Fixes Review Center</h1>
          <p className="view-page-subtitle">
            Synthesized code patches ready for developer review, testing, and acceptance.
          </p>
        </div>
        <div className="fixes-badge-pill">
          <CodeIcon size={16} />
          <span>{fixesIssues.length} Synthesized Patches</span>
        </div>
      </div>

      {fixesIssues.length === 0 ? (
        <div className="empty-view-panel">
          <CodeIcon size={40} className="empty-panel-icon" />
          <h3 className="empty-panel-title">No AI Fixes Synthesized Yet</h3>
          <p className="empty-panel-desc">
            Select an issue from the Issues tab or Dashboard and click "Analyze Issue" to generate an automated code patch.
          </p>
        </div>
      ) : (
        <div className="fixes-table-wrapper">
          <table className="fixes-data-table">
            <thead>
              <tr>
                <th>ISSUE</th>
                <th>TARGET FILE</th>
                <th>STATUS</th>
                <th>ESTIMATED DIFF</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {fixesIssues.map((issue) => {
                const isAccepted = issue.status === 'accepted';
                const isRejected = issue.status === 'rejected';

                return (
                  <tr key={issue._id} className="fixes-row-item">
                    <td className="col-issue-info">
                      <span className="issue-num-box">#{issue.number}</span>
                      <strong className="issue-title-strong">{issue.title}</strong>
                    </td>
                    <td className="col-file-target">
                      <div className="file-target-cell">
                        <FileIcon size={14} />
                        <code>{issue.suggestedFile || 'source file'}</code>
                      </div>
                    </td>
                    <td className="col-patch-status">
                      {isAccepted ? (
                        <span className="status-badge-pill accepted">
                          <CheckCircleIcon size={12} />
                          Applied to Disk
                        </span>
                      ) : isRejected ? (
                        <span className="status-badge-pill rejected">
                          <XCircleIcon size={12} />
                          Discarded
                        </span>
                      ) : (
                        <span className="status-badge-pill ready">
                          <SparklesIcon size={12} />
                          Ready for Review
                        </span>
                      )}
                    </td>
                    <td className="col-diff-metrics">
                      <span className="diff-add">+18</span>
                      <span className="diff-del">-7</span>
                    </td>
                    <td className="col-open-action">
                      <button
                        className="btn-inspect-diff"
                        onClick={() => handleInspect(issue)}
                        title="Open Fix Workspace for this patch"
                      >
                        Inspect Diff →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
