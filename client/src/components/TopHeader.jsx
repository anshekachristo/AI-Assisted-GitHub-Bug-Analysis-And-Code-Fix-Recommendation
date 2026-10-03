import {
  GithubIcon,
  GitBranchIcon,
  SparklesIcon
} from './Icons';
import CustomModelSelector from './CustomModelSelector';

export default function TopHeader({
  owner = 'axios',
  repo = 'axios',
  onSelectSampleRepo = () => {},
  models = [],
  selectedModel = 'gpt-oss-120b',
  onSelectModel = () => {},
  isAnalyzing = false
}) {
  const sampleRepos = [
    { owner: 'axios', repo: 'axios', label: 'axios / axios' },
    { owner: 'expressjs', repo: 'express', label: 'expressjs / express' },
    { owner: 'chalk', repo: 'chalk', label: 'chalk / chalk' }
  ];

  return (
    <header className="app-top-header">
      {/* LEFT: Current repository */}
      <div className="header-left">
        <div className="current-repo-badge">
          <GithubIcon size={16} className="repo-gh-icon" />
          <span className="repo-owner-txt">{owner}</span>
          <span className="repo-sep">/</span>
          <span className="repo-name-txt">{repo}</span>
          <span className="repo-branch-pill">
            <GitBranchIcon size={11} />
            <span>main</span>
          </span>
        </div>
      </div>

      {/* CENTER: Quick repository selectors */}
      <div className="header-center">
        <div className="quick-repos-group">
          <span className="quick-repos-label">Quick Repos:</span>
          {sampleRepos.map((sr) => {
            const isActive = owner === sr.owner && repo === sr.repo;
            return (
              <button
                key={`${sr.owner}/${sr.repo}`}
                className={`quick-repo-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  console.log('[UI] Quick repo clicked:', sr.owner, sr.repo);
                  onSelectSampleRepo(sr.owner, sr.repo);
                }}
                title={`Switch to ${sr.owner}/${sr.repo}`}
              >
                {sr.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Engine Ready, AI Model, Demo Mode */}
      <div className="header-right">
        <div className="engine-ready-pill">
          <span className="engine-dot-live"></span>
          <span className="engine-status-text">
            {isAnalyzing ? 'Analyzing…' : 'Engine Ready'}
          </span>
        </div>

        <CustomModelSelector
          models={models}
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
          size="compact"
        />

        <div className="demo-mode-pill" title="BUGFIX AI Demo Environment">
          <SparklesIcon size={12} />
          <span>Demo Mode</span>
        </div>
      </div>
    </header>
  );
}
