import { useState } from 'react';
import { BugIcon, SearchIcon, SparklesIcon, CheckCircleIcon, FileIcon, ExternalLinkIcon } from './Icons';

export default function IssuesView({
  issues = [],
  selectedIssue = null,
  onSelectIssue = () => {},
  onAnalyzeIssue = () => {},
  onNavigateTo = () => {},
  owner = 'axios',
  repo = 'axios'
}) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filtered = issues.filter((i) => {
    const matchesSearch =
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.body?.toLowerCase().includes(search.toLowerCase()) ||
      String(i.number).includes(search);
    if (!matchesSearch) return false;

    if (activeFilter === 'BUGS') {
      return (i.labels || []).some((l) =>
        l.toLowerCase().includes('bug') || l.toLowerCase().includes('error')
      );
    }
    if (activeFilter === 'ANALYZED') {
      return !!i.suggestedFile;
    }
    if (activeFilter === 'FIXED') {
      return !!i.suggestedFix || i.status === 'accepted';
    }
    return true;
  });

  const handleInspect = (issue) => {
    console.log('[UI] IssuesView: inspecting issue', issue.number);
    onSelectIssue(issue);
    onNavigateTo('Dashboard');
  };

  const handleAnalyzeDirect = (issue) => {
    console.log('[UI] IssuesView: analyzing issue', issue.number);
    onSelectIssue(issue);
    onAnalyzeIssue(issue);
    onNavigateTo('Dashboard');
  };

  return (
    <div className="view-content-wrapper issues-page">
      <div className="view-page-header">
        <div>
          <h1 className="view-page-title">Issues Queue</h1>
          <p className="view-page-subtitle">
            Synchronized repository issues for <strong>{owner}/{repo}</strong>.
          </p>
        </div>
        <div className="issues-stat-pill">
          <span>{filtered.length} of {issues.length} Issues Loaded</span>
        </div>
      </div>

      <div className="issues-filter-card">
        <div className="issues-search-bar">
          <SearchIcon size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search issues by #id, keywords, or error description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="issues-search-input"
          />
          {search && (
            <button className="search-clear-btn" onClick={() => setSearch('')}>×</button>
          )}
        </div>

        <div className="issues-tabs-group">
          {['ALL', 'BUGS', 'ANALYZED', 'FIXED'].map((filter) => (
            <button
              key={filter}
              className={`filter-pill-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="issues-table-panel">
        {filtered.length === 0 ? (
          <div className="issues-empty-state">
            <BugIcon size={32} />
            <h4>No matching issues found</h4>
            <p>Try clearing your filter or searching for another keyword.</p>
          </div>
        ) : (
          <div className="issues-rows-container">
            {filtered.map((issue) => {
              const isSelected = selectedIssue?._id === issue._id;
              const hasFix = !!issue.suggestedFix;
              const isAccepted = issue.status === 'accepted';
              const hasAnalysis = !!issue.suggestedFile;

              return (
                <div
                  key={issue._id}
                  className={`issue-row-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleInspect(issue)}
                >
                  <div className="issue-row-left">
                    <div className="issue-row-top">
                      <span className="issue-tag-num">#{issue.number}</span>
                      <h3 className="issue-row-title">{issue.title}</h3>
                      {issue.url && (
                        <a
                          href={issue.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="issue-row-gh-link"
                          onClick={(e) => e.stopPropagation()}
                          title="View on GitHub"
                        >
                          <ExternalLinkIcon size={12} />
                        </a>
                      )}
                    </div>

                    {issue.body && (
                      <p className="issue-row-desc">
                        {issue.body.slice(0, 150)}
                        {issue.body.length > 150 ? '...' : ''}
                      </p>
                    )}

                    <div className="issue-row-pills">
                      {(issue.labels || []).slice(0, 3).map((lbl) => (
                        <span key={lbl} className="label-tag-pill">{lbl}</span>
                      ))}
                      {issue.suggestedFile && (
                        <span className="file-tag-pill">
                          <FileIcon size={12} />
                          <code>{issue.suggestedFile}</code>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="issue-row-right">
                    <div className="status-tag-container">
                      {isAccepted ? (
                        <span className="status-pill accepted">
                          <CheckCircleIcon size={12} />
                          Fix Applied
                        </span>
                      ) : hasFix ? (
                        <span className="status-pill fix-ready">
                          <SparklesIcon size={12} />
                          Fix Ready
                        </span>
                      ) : hasAnalysis ? (
                        <span className="status-pill analyzed">Analyzed</span>
                      ) : (
                        <span className="status-pill open">Open</span>
                      )}
                    </div>

                    <div className="issue-action-btns">
                      {hasFix ? (
                        <button
                          className="btn-row-action primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspect(issue);
                          }}
                        >
                          Review Fix →
                        </button>
                      ) : (
                        <button
                          className="btn-row-action secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnalyzeDirect(issue);
                          }}
                        >
                          <SparklesIcon size={13} />
                          <span>Analyze</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
