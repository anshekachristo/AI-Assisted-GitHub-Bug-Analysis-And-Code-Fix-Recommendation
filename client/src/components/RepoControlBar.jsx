import {
  GithubIcon,
  BugIcon,
  CpuIcon,
  SparklesIcon
} from './Icons';
import CustomModelSelector from './CustomModelSelector';

export default function RepoControlBar({
  owner = 'axios',
  setOwner = () => {},
  repo = 'axios',
  setRepo = () => {},
  selectedIssue = null,
  models = [],
  selectedModel = 'gpt-oss-120b',
  setSelectedModel = () => {},
  onAnalyze = () => {},
  onFetchIssues = () => {},
  loading = false
}) {
  const handleFetchClick = () => {
    console.log('[UI] Fetch Issues clicked for:', owner, repo);
    onFetchIssues(owner, repo);
  };

  const handleAnalyzeClick = () => {
    console.log('[UI] Analyze button clicked');
    console.log('[UI] Selected issue:', selectedIssue);
    console.log('[UI] Selected model:', selectedModel);
    onAnalyze();
  };

  return (
    <div className="execution-config-card">
      <div className="config-header">
        <h2 className="config-title">Execution Configuration</h2>
        <p className="config-subtitle">
          Configure target repository and AI model parameters.
        </p>
      </div>

      <div className="config-fields-grid">
        {/* Field 1: Repository */}
        <div className="config-field">
          <label className="field-label">
            <GithubIcon size={14} />
            <span>Repository</span>
          </label>
          <div className="repo-input-row">
            <div className="repo-inputs-box">
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="owner"
                className="repo-input"
                aria-label="Repository Owner"
              />
              <span className="repo-slash">/</span>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="repository"
                className="repo-input"
                aria-label="Repository Name"
              />
            </div>
            <button
              className="btn-fetch-issues"
              onClick={handleFetchClick}
              disabled={loading || !owner || !repo}
              title="Fetch repository issues from GitHub"
            >
              {loading ? 'Fetching…' : 'Fetch Issues'}
            </button>
          </div>
        </div>

        {/* Field 2: Active Issue */}
        <div className="config-field">
          <label className="field-label">
            <BugIcon size={14} />
            <span>Active Issue</span>
          </label>
          <div className="active-issue-box">
            {selectedIssue ? (
              <div className="active-issue-content">
                <span className="active-issue-id">#{selectedIssue.number}</span>
                <span className="active-issue-title" title={selectedIssue.title}>
                  {selectedIssue.title}
                </span>
              </div>
            ) : (
              <span className="active-issue-placeholder">
                Select an issue from queue below
              </span>
            )}
          </div>
        </div>

        {/* Field 3: AI Model */}
        <div className="config-field">
          <label className="field-label">
            <CpuIcon size={14} />
            <span>AI Model</span>
          </label>
          <div className="model-dropdown-container">
            <CustomModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          </div>
        </div>
      </div>

      {/* Primary Analyze Action Button */}
      <div className="config-action-row">
        <button
          className="btn-primary-action"
          onClick={handleAnalyzeClick}
          disabled={loading || !selectedIssue}
          title={!selectedIssue ? 'Select an issue first' : 'Analyze issue with AI'}
        >
          <SparklesIcon size={16} />
          <span>
            {loading
              ? 'Analyzing Repository…'
              : selectedIssue?.suggestedFix
              ? 'Re-analyze & Generate Fix'
              : 'Analyze Issue'}
          </span>
        </button>
      </div>
    </div>
  );
}
