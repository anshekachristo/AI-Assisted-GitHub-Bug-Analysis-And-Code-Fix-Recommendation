import { useState } from 'react';
import {
  BugIcon,
  SearchIcon,
  SparklesIcon,
  CheckCircleIcon,
  FileIcon
} from './Icons';

export default function IssueList({
  issues = [],
  selectedIssue = null,
  onSelectIssue = () => {},
  onAnalyzeIssue = () => {},
  onReviewFix = () => {},
  owner = 'axios',
  repo = 'axios',
  loading = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(issue.number).includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterType === 'BUGS') {
      return (issue.labels || []).some((l) =>
        l.toLowerCase().includes('bug') || l.toLowerCase().includes('error')
      );
    }
    if (filterType === 'ANALYZED') {
      return !!issue.suggestedFile;
    }
    if (filterType === 'FIXED') {
      return !!issue.suggestedFix || issue.status === 'accepted';
    }
    return true;
  });

  return (
    <aside className="issue-queue-card">
      {/* Header */}
      <div className="queue-card-header">
        <div className="queue-header-title-row">
          <div className="queue-title-group">
            <BugIcon size={16} className="queue-title-icon" />
            <h3 className="queue-title">Issue Queue</h3>
          </div>
          <span className="queue-count-badge">{filteredIssues.length} items</span>
        </div>

        {/* Search */}
        <div className="queue-search-box">
          <SearchIcon size={14} className="queue-search-icon" />
          <input
            type="text"
            placeholder="Filter issues by #id, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="queue-search-input"
          />
          {searchQuery && (
            <button
              className="queue-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="queue-filter-tabs">
          {['ALL', 'BUGS', 'ANALYZED', 'FIXED'].map((type) => (
            <button
              key={type}
              className={`filter-tab-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => {
                console.log('[UI] Filter clicked:', type);
                setFilterType(type);
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="queue-items-list">
        {loading ? (
          <div className="queue-loading">
            <div className="skeleton-bar"></div>
            <div className="skeleton-bar"></div>
            <div className="skeleton-bar"></div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="queue-empty">
            <p className="empty-title">No issues found</p>
            <p className="empty-subtitle">
              {searchQuery
                ? 'Try a different search query or clear the filter.'
                : 'Click "Fetch Issues" above to populate the queue from GitHub.'}
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isSelected = selectedIssue?._id === issue._id;
            const hasAnalysis = !!issue.suggestedFile;
            const hasFix = !!issue.suggestedFix;
            const isAccepted = issue.status === 'accepted';
            const issueRepo = `${issue.owner || owner} / ${issue.repo || repo}`;

            return (
              <div
                key={issue._id}
                role="button"
                tabIndex={0}
                className={`issue-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  console.log('[UI] Issue selected:', issue.number, issue.title);
                  onSelectIssue(issue);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectIssue(issue);
                  }
                }}
              >
                <div className="issue-card-top">
                  <div className="issue-card-id-row">
                    <span className="issue-number-tag">#{issue.number}</span>
                    <span className="issue-repo-tag">{issueRepo}</span>
                  </div>

                  <div className="issue-status-badge">
                    {isAccepted ? (
                      <span className="badge-pill accepted">
                        <CheckCircleIcon size={11} />
                        FIX APPLIED
                      </span>
                    ) : hasFix ? (
                      <span className="badge-pill fix-ready">
                        <SparklesIcon size={11} />
                        FIX READY
                      </span>
                    ) : hasAnalysis ? (
                      <span className="badge-pill analyzed">ANALYZED</span>
                    ) : (
                      <span className="badge-pill open">OPEN</span>
                    )}
                  </div>
                </div>

                <h4 className="issue-card-title" title={issue.title}>
                  {issue.title}
                </h4>

                <div className="issue-card-actions">
                  <div className="issue-labels-wrap">
                    {(issue.labels || []).slice(0, 2).map((lbl) => (
                      <span key={lbl} className="issue-label-pill">{lbl}</span>
                    ))}
                  </div>

                  {/* Explicit Action Button per user requirement */}
                  {hasFix ? (
                    <button
                      className="btn-card-action review"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('[UI] Review Fix clicked for issue:', issue.number);
                        onSelectIssue(issue);
                        onReviewFix(issue);
                      }}
                      title="Inspect side-by-side diff"
                    >
                      <span>Review Fix →</span>
                    </button>
                  ) : (
                    <button
                      className="btn-card-action analyze"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('[UI] Analyze clicked for issue:', issue.number);
                        onSelectIssue(issue);
                        onAnalyzeIssue(issue);
                      }}
                      title="Analyze this issue with AI"
                    >
                      <SparklesIcon size={12} />
                      <span>Analyze</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
