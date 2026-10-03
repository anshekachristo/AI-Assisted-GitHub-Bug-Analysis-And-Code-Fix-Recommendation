import { GithubIcon, GitBranchIcon, CheckCircleIcon, SparklesIcon, ExternalLinkIcon } from './Icons';

export default function RepositoriesView({
  currentOwner = 'axios',
  currentRepo = 'axios',
  onSelectRepo = () => {},
  onFetchIssues = () => {},
  onNavigateTo = () => {}
}) {
  const curatedRepositories = [
    {
      owner: 'axios',
      repo: 'axios',
      description: 'Promise based HTTP client for the browser and node.js',
      stars: '104k',
      language: 'JavaScript',
      branch: 'main',
      status: 'Cloned & Ready',
      activeIssues: 8
    },
    {
      owner: 'expressjs',
      repo: 'express',
      description: 'Fast, unopinionated, minimalist web framework for node.',
      stars: '64k',
      language: 'JavaScript',
      branch: 'master',
      status: 'Cloned & Ready',
      activeIssues: 12
    },
    {
      owner: 'chalk',
      repo: 'chalk',
      description: 'Terminal string styling done right with automated color support detection.',
      stars: '22k',
      language: 'TypeScript',
      branch: 'main',
      status: 'Ready to Clone',
      activeIssues: 5
    },
    {
      owner: 'facebook',
      repo: 'react',
      description: 'The library for web and native user interfaces.',
      stars: '228k',
      language: 'JavaScript',
      branch: 'main',
      status: 'Ready to Clone',
      activeIssues: 34
    }
  ];

  const handleConnect = (owner, repo) => {
    console.log('[UI] RepositoriesView: connecting to', owner, repo);
    onSelectRepo(owner, repo);
    onFetchIssues(owner, repo);
    onNavigateTo('Dashboard');
  };

  return (
    <div className="view-content-wrapper repositories-page">
      <div className="view-page-header">
        <div>
          <h1 className="view-page-title">Repositories</h1>
          <p className="view-page-subtitle">
            Manage target GitHub workspaces and local cloned directories.
          </p>
        </div>
        <div className="current-repo-card">
          <span className="current-repo-label">ACTIVE REPOSITORY</span>
          <div className="current-repo-val">
            <GithubIcon size={16} />
            <strong>{currentOwner} / {currentRepo}</strong>
            <span className="live-pill">● CONNECTED</span>
          </div>
        </div>
      </div>

      <div className="repos-cards-grid">
        {curatedRepositories.map((r) => {
          const isCurrent =
            currentOwner.toLowerCase() === r.owner.toLowerCase() &&
            currentRepo.toLowerCase() === r.repo.toLowerCase();

          return (
            <div
              key={`${r.owner}/${r.repo}`}
              className={`repo-item-card ${isCurrent ? 'active' : ''}`}
            >
              <div className="repo-item-top">
                <div className="repo-title-block">
                  <GithubIcon size={20} className="repo-gh-logo" />
                  <div>
                    <h3 className="repo-title-text">
                      {r.owner}/<span className="highlight">{r.repo}</span>
                    </h3>
                    <div className="repo-meta-row">
                      <GitBranchIcon size={12} />
                      <span>{r.branch}</span>
                      <span className="bullet-sep">•</span>
                      <span>{r.language}</span>
                    </div>
                  </div>
                </div>
                {isCurrent && (
                  <span className="badge-connected">
                    <CheckCircleIcon size={12} />
                    Active
                  </span>
                )}
              </div>

              <p className="repo-desc">{r.description}</p>

              <div className="repo-metrics-row">
                <div className="metric-box">
                  <span className="metric-lbl">STARS</span>
                  <span className="metric-val">{r.stars}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">ISSUES</span>
                  <span className="metric-val">{r.activeIssues}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">STATUS</span>
                  <span className="metric-val green">{r.status}</span>
                </div>
              </div>

              <div className="repo-footer-actions">
                <button
                  className={`btn-repo-connect ${isCurrent ? 'active' : ''}`}
                  onClick={() => handleConnect(r.owner, r.repo)}
                >
                  <SparklesIcon size={14} />
                  <span>{isCurrent ? 'Synchronize Issues' : 'Connect & Analyze →'}</span>
                </button>
                <a
                  href={`https://github.com/${r.owner}/${r.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-ext-btn"
                  title="View on GitHub"
                >
                  <ExternalLinkIcon size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
