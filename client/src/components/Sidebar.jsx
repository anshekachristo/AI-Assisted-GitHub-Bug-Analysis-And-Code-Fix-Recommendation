import {
  SparklesIcon,
  BugIcon,
  GithubIcon,
  LayersIcon,
  CodeIcon,
  ClockIcon
} from './Icons';

export default function Sidebar({
  activeNav = 'Dashboard',
  onSelectNav = () => {},
  issuesCount = 0,
  fixesCount = 0,
  connectedRepo = 'axios/axios'
}) {
  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayersIcon },
    { id: 'Issues', label: 'Issues', icon: BugIcon, badge: issuesCount > 0 ? issuesCount : null },
    { id: 'Repositories', label: 'Repositories', icon: GithubIcon },
    { id: 'AI Analysis', label: 'AI Analysis', icon: SparklesIcon },
    { id: 'Fixes', label: 'Fixes', icon: CodeIcon, badge: fixesCount > 0 ? fixesCount : null },
    { id: 'History', label: 'History', icon: ClockIcon }
  ];

  return (
    <aside className="app-sidebar">
      {/* Top: Logo area */}
      <div className="sidebar-top">
        <div className="brand-header">
          <div className="brand-title-line">
            <span className="brand-name">BUGFIX AI</span>
            <span className="brand-badge">AI</span>
          </div>
          <span className="brand-sub">AI-Powered Code Intelligence</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-navigation">
        <div className="nav-section-title">WORKSPACE</div>
        <div className="nav-links-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                className={`sidebar-nav-button ${isActive ? 'active' : ''}`}
                onClick={() => {
                  console.log('[UI] Navigation clicked:', item.id);
                  onSelectNav(item.id);
                }}
              >
                <div className="button-main-content">
                  <Icon size={16} className="button-icon" />
                  <span className="button-label">{item.label}</span>
                </div>
                <div className="button-aside">
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="button-counter">{item.badge}</span>
                  )}
                  {isActive && <span className="button-active-dot"></span>}
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom status and reviewer profile */}
      <div className="sidebar-bottom-panel">
        <div className="status-box">
          <div className="status-row">
            <span className="status-title">GitHub API</span>
            <span className="status-connected-tag">CONNECTED</span>
          </div>
          <div className="status-repo-tag" title={connectedRepo}>
            <GithubIcon size={12} />
            <span>{connectedRepo}</span>
          </div>
        </div>

        <div className="reviewer-box">
          <div className="reviewer-avatar">AE</div>
          <div className="reviewer-info">
            <span className="reviewer-title">AI Code Reviewer</span>
            <span className="reviewer-sub">Autonomous v3.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
