import { useState, useEffect } from 'react';
import {
  fetchIssues,
  cloneRepo,
  analyzeIssue,
  suggestFix,
  acceptFix,
  rejectFix,
  getFileContent,
  fetchModels
} from './api';

import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import StatCards from './components/StatCards';
import WorkflowPipeline from './components/WorkflowPipeline';
import RepoControlBar from './components/RepoControlBar';
import IssueList from './components/IssueList';
import IssueAnalysisWorkspace from './components/IssueAnalysisWorkspace';
import AffectedFiles from './components/AffectedFiles';
import DiffWorkspace from './components/DiffWorkspace';
import ConfirmationModal from './components/ConfirmationModal';
import AIProcessingModal from './components/AIProcessingModal';
import Toast from './components/Toast';

// Navigation Views
import IssuesView from './components/IssuesView';
import RepositoriesView from './components/RepositoriesView';
import AIAnalysisView from './components/AIAnalysisView';
import FixesView from './components/FixesView';
import HistoryView from './components/HistoryView';

import {
  SparklesIcon,
  GithubIcon
} from './components/Icons';

import './App.css';

// Route URL mapping table
const ROUTE_MAP = {
  '/dashboard': 'Dashboard',
  '/issues': 'Issues',
  '/repositories': 'Repositories',
  '/analysis': 'AI Analysis',
  '/fixes': 'Fixes',
  '/history': 'History'
};

const NAV_TO_ROUTE = {
  'Dashboard': '/dashboard',
  'Issues': '/issues',
  'Repositories': '/repositories',
  'AI Analysis': '/analysis',
  'Fixes': '/fixes',
  'History': '/history'
};

function App() {
  const [owner, setOwner] = useState('axios');
  const [repo, setRepo] = useState('axios');
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [toastType, setToastType] = useState('info');
  const [originalCode, setOriginalCode] = useState('');
  const [fixedCode, setFixedCode] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gpt-oss-120b');
  const [affectedFixes, setAffectedFixes] = useState({});
  const [fixingFile, setFixingFile] = useState(null);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [showFixWorkspace, setShowFixWorkspace] = useState(false);

  // Modals state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    description: '',
    confirmText: '',
    onConfirm: () => {}
  });

  const [aiModal, setAiModal] = useState({
    isOpen: false,
    message: ''
  });

  const showToast = (msg, type = 'info') => {
    setStatusMsg(msg);
    setToastType(type);
  };

  const extractCode = (aiResponse) => {
    if (!aiResponse) return '';
    let codePart = aiResponse;
    const fixedCodeIdx = aiResponse.indexOf('FIXED_CODE:');
    if (fixedCodeIdx !== -1) {
      codePart = aiResponse.slice(fixedCodeIdx + 'FIXED_CODE:'.length);
    }
    const match = codePart.match(/```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)```/);
    if (match) return match[1].trim();
    const anyMatch = aiResponse.match(/```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)```/);
    if (anyMatch) return anyMatch[1].trim();
    if (fixedCodeIdx !== -1) return codePart.trim();
    return aiResponse.trim();
  };

  const extractExplanation = (aiResponse) => {
    if (!aiResponse) return '';
    const match = aiResponse.match(/EXPLANATION:\s*([\s\S]*?)(?:\r?\n\s*FIXED_CODE:|$)/i);
    return match ? match[1].trim() : '';
  };

  // State-based navigation that updates real browser URL
  const handleNavigate = (navId) => {
    console.log('[UI] Navigation requested:', navId);
    setActiveNav(navId);
    const path = NAV_TO_ROUTE[navId] || '/dashboard';
    window.history.pushState({ nav: navId }, '', path);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const initialPath = window.location.pathname;
    if (ROUTE_MAP[initialPath]) {
      setActiveNav(ROUTE_MAP[initialPath]);
    } else {
      window.history.replaceState({ nav: 'Dashboard' }, '', '/dashboard');
    }

    const onPopState = (e) => {
      const nav = e.state?.nav || ROUTE_MAP[window.location.pathname] || 'Dashboard';
      console.log('[UI] Browser history popped:', nav);
      setActiveNav(nav);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Load models on startup
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('[API] Fetching available models...');
        const res = await fetchModels();
        console.log('[API] Models loaded:', res.data);
        setModels(res.data);
      } catch (err) {
        console.error('[API] Failed to load models:', err);
      }
    };
    loadModels();
  }, []);

  // Fetch initial issues on startup
  useEffect(() => {
    handleFetchIssues('axios', 'axios');
  }, []);

  // Sync original code when selectedIssue changes
  useEffect(() => {
    const loadOriginalCode = async () => {
      if (selectedIssue?._id && selectedIssue?.suggestedFile) {
        try {
          console.log('[API] Loading file content for issue:', selectedIssue._id, selectedIssue.suggestedFile);
          const fileRes = await getFileContent(selectedIssue._id);
          console.log('[API] File content response:', fileRes.data);

          const code = fileRes.data.originalCode || fileRes.data.content || '';
          if (code) {
            setOriginalCode(code);
          }
          if (fileRes.data.fixedCode) {
            setFixedCode(fileRes.data.fixedCode);
          }
        } catch (err) {
          console.error('[API] Failed to load file content via API:', err.response?.data || err.message);
        }
      }
    };
    loadOriginalCode();
  }, [selectedIssue?._id, selectedIssue?.suggestedFile]);

  // Fetch issues handler
  const handleFetchIssues = async (overrideOwner = owner, overrideRepo = repo) => {
    setLoading(true);
    console.log('[UI] Fetching issues for:', overrideOwner, overrideRepo);
    showToast(`Connecting to GitHub API for ${overrideOwner}/${overrideRepo}...`, 'info');
    try {
      const res = await fetchIssues(overrideOwner, overrideRepo);
      console.log('[API] Issues fetched successfully:', res.data.issues.length, 'issues');
      setIssues(res.data.issues);
      if (res.data.usedFallback) {
        showToast(`Showing all ${res.data.issues.length} open issues (no labeled bugs found)`, 'info');
      } else {
        showToast(`Loaded ${res.data.issues.length} labeled bugs from ${overrideOwner}/${overrideRepo}`, 'success');
      }
      if (res.data.issues.length > 0) {
        handleSelectIssue(res.data.issues[0]);
      }
    } catch (err) {
      console.error('[API] Error fetching issues:', err);
      showToast('Error fetching issues: ' + err.message, 'error');
    }
    setLoading(false);
  };

  // Quick repository selector
  const handleSelectSampleRepo = (sampleOwner, sampleRepo) => {
    console.log('[UI] Sample repo selected:', sampleOwner, sampleRepo);
    setOwner(sampleOwner);
    setRepo(sampleRepo);
    setSelectedIssue(null);
    setOriginalCode('');
    setFixedCode('');
    setShowFixWorkspace(false);
    handleFetchIssues(sampleOwner, sampleRepo);
    handleNavigate('Dashboard');
  };

  // Issue selection handler
  const handleSelectIssue = (issue) => {
    console.log('[UI] Selecting issue:', issue.number, issue.title);
    setSelectedIssue(issue);
    const orig = issue.originalCode || '';
    const fix = issue.fixedCode || extractCode(issue.suggestedFix) || '';
    setOriginalCode(orig);
    setFixedCode(fix);

    const refFiles = [
      ...(issue.suggestedFile ? [issue.suggestedFile] : []),
      ...(issue.affectedFiles || [])
    ].filter((f, idx, arr) => arr.indexOf(f) === idx);
    console.log('[REFERENCED FILES] API response:', issue);
    console.log('[REFERENCED FILES] Data passed to UI:', refFiles);
    console.log('[REFERENCED FILES] Count:', refFiles?.length);
  };

  // Inspect and navigate to Fix Workspace
  const handleOpenFixWorkspace = (issue) => {
    console.log('[UI] Opening Fix Workspace for issue:', issue?.number || selectedIssue?.number);
    if (issue) handleSelectIssue(issue);
    setShowFixWorkspace(true);
    handleNavigate('Dashboard');
  };

  // Clone and analyze issue handler
  const handleCloneAndAnalyze = async (targetIssue = selectedIssue) => {
    if (!targetIssue) return;
    setLoading(true);
    console.log('[UI] Analyze clicked');
    console.log('[UI] Selected issue:', targetIssue);
    console.log('[UI] Selected model:', selectedModel);

    setAiModal({
      isOpen: true,
      message: 'Running autonomous bug localization and fix synthesis...'
    });

    try {
      const issueOwner = targetIssue.owner || owner;
      const issueRepo = targetIssue.repo || repo;

      console.log('[API] Cloning repository:', issueOwner, issueRepo);
      await cloneRepo(issueOwner, issueRepo);

      console.log('[API] Calling /api/analyze with issueId:', targetIssue._id, 'model:', selectedModel);
      const analyzeRes = await analyzeIssue(targetIssue._id, selectedModel);
      console.log('[API] Analysis response:', analyzeRes.data);
      console.log('[REFERENCED FILES] API response:', analyzeRes.data);
      console.log('[REFERENCED FILES] Data passed to UI:', analyzeRes.data.affectedFiles);
      console.log('[REFERENCED FILES] Count:', analyzeRes.data.affectedFiles?.length);

      const analyzedOriginal = analyzeRes.data.originalCode || '';
      if (analyzedOriginal) {
        setOriginalCode(analyzedOriginal);
      }

      const updatedIssue = {
        ...targetIssue,
        suggestedFile: analyzeRes.data.suggestedFile,
        affectedFiles: analyzeRes.data.affectedFiles,
        referencedFiles: analyzeRes.data.affectedFiles,
        originalCode: analyzedOriginal || targetIssue.originalCode || ''
      };
      setSelectedIssue(updatedIssue);

      console.log('[API] Calling /api/fix with issueId:', targetIssue._id, 'model:', selectedModel);
      const fixRes = await suggestFix(targetIssue._id, selectedModel);
      console.log('[API] Fix synthesis response:', fixRes.data);

      const receivedOriginal = fixRes.data.originalCode || analyzedOriginal || originalCode || '';
      const receivedFixed = fixRes.data.fixedCode || extractCode(fixRes.data.suggestedFix) || '';

      setOriginalCode(receivedOriginal);
      setFixedCode(receivedFixed);

      const fullyUpdatedIssue = {
        ...updatedIssue,
        suggestedFix: fixRes.data.suggestedFix,
        originalCode: receivedOriginal,
        fixedCode: receivedFixed
      };
      setSelectedIssue(fullyUpdatedIssue);

      // Also update in issues array so list reflects new fix
      setIssues((prev) =>
        prev.map((i) => (i._id === fullyUpdatedIssue._id ? fullyUpdatedIssue : i))
      );

      setAiModal({ isOpen: false, message: '' });
      showToast('✦ AI Fix synthesized and ready for verification in Fix Workspace', 'success');

      // Automatically open Fix Workspace on completion
      setShowFixWorkspace(true);
    } catch (err) {
      console.error('[API] Analysis or synthesis error:', err);
      setAiModal({ isOpen: false, message: '' });
      showToast('Error: ' + (err.response?.data?.error || err.message), 'error');
    }
    setLoading(false);
  };

  // Fix single affected file
  const handleFixAffectedFile = async (filePath) => {
    if (!selectedIssue) return;
    setFixingFile(filePath);
    console.log('[UI] Generating fix for affected file:', filePath, 'using model:', selectedModel);
    showToast(`Synthesizing patch for ${filePath}...`, 'info');
    try {
      const fixRes = await suggestFix(selectedIssue._id, selectedModel, filePath);
      console.log('[API] Affected file fix response:', fixRes.data);

      const receivedOriginal = fixRes.data.originalCode || '';
      const receivedFixed = fixRes.data.fixedCode || extractCode(fixRes.data.suggestedFix) || '';

      setAffectedFixes((prev) => ({
        ...prev,
        [filePath]: {
          suggestedFix: fixRes.data.suggestedFix,
          originalCode: receivedOriginal,
          fixedCode: receivedFixed,
          status: 'pending'
        }
      }));
      showToast(`Fix synthesized for ${filePath}. Click 'Review Fix' to inspect.`, 'success');
    } catch (err) {
      console.error('[API] Error fixing affected file:', err);
      showToast('Error: ' + (err.response?.data?.error || err.message), 'error');
    }
    setFixingFile(null);
  };

  // Accept fix for affected file
  const handleAcceptAffectedFile = (filePath) => {
    if (!selectedIssue) return;
    setConfirmModal({
      isOpen: true,
      type: 'confirm',
      title: 'Apply Patch to Affected File?',
      description: `This will update "${filePath}" in the cloned repository with the AI verified patch.`,
      confirmText: 'Apply Patch',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoading(true);
        console.log('[UI] Applying fix to affected file:', filePath);
        try {
          const res = await acceptFix(selectedIssue._id, filePath);
          console.log('[API] Accept affected file response:', res.data);
          setAffectedFixes((prev) => ({
            ...prev,
            [filePath]: { ...prev[filePath], status: 'accepted' }
          }));
          showToast(`✓ Fix applied successfully to ${filePath}`, 'success');
        } catch (err) {
          console.error('[API] Error applying affected file fix:', err);
          showToast('Error applying fix: ' + err.message, 'error');
        }
        setLoading(false);
      }
    });
  };

  // Accept main AI Fix
  const handleTriggerAccept = () => {
    if (!selectedIssue) return;
    console.log('[UI] Accept AI Fix triggered for issue:', selectedIssue.number);
    setConfirmModal({
      isOpen: true,
      type: 'confirm',
      title: 'Apply AI Code Fix?',
      description: `This will update "${selectedIssue.suggestedFile}" in the local repository with the AI-synthesized changes. A .backup file will be preserved for safety.`,
      confirmText: 'Apply AI Fix',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoading(true);
        console.log('[API] Calling /api/accept for issueId:', selectedIssue._id);
        try {
          const res = await acceptFix(selectedIssue._id);
          console.log('[API] Accept response:', res.data);
          const updated = { ...selectedIssue, status: 'accepted' };
          setSelectedIssue(updated);
          setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
          showToast(`✓ Fix applied successfully to ${selectedIssue.suggestedFile}`, 'success');
        } catch (err) {
          console.error('[API] Error accepting fix:', err);
          showToast('Error accepting fix: ' + err.message, 'error');
        }
        setLoading(false);
      }
    });
  };

  // Reject main AI Fix
  const handleTriggerReject = () => {
    if (!selectedIssue) return;
    console.log('[UI] Reject Fix triggered for issue:', selectedIssue.number);
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      title: 'Discard AI Fix?',
      description: 'Are you sure you want to discard this fix? The file will remain in its original repository state.',
      confirmText: 'Discard Fix',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoading(true);
        console.log('[API] Calling /api/reject for issueId:', selectedIssue._id);
        try {
          const res = await rejectFix(selectedIssue._id);
          console.log('[API] Reject response:', res.data);
          const updated = { ...selectedIssue, status: 'rejected' };
          setSelectedIssue(updated);
          setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
          showToast('Fix rejected', 'error');
        } catch (err) {
          console.error('[API] Error rejecting fix:', err);
          showToast('Error rejecting fix: ' + err.message, 'error');
        }
        setLoading(false);
      }
    });
  };

  // Values passed into DiffViewer
  const activeOriginalCode = originalCode || selectedIssue?.originalCode || '';
  const activeFixedCode = fixedCode || selectedIssue?.fixedCode || extractCode(selectedIssue?.suggestedFix) || '';

  // Stats calculation
  const totalIssuesCount = issues.length;
  const analyzedCount = issues.filter((i) => !!i.suggestedFile).length;
  const fixesCount = issues.filter((i) => !!i.suggestedFix || i.status === 'accepted').length;

  return (
    <div className="app-shell-root">
      {/* 1. TOP HEADER (Across top: 64px-72px) */}
      <TopHeader
        owner={owner}
        repo={repo}
        onSelectSampleRepo={handleSelectSampleRepo}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={(m) => {
          console.log('[UI] Selected model updated in App:', m);
          setSelectedModel(m);
        }}
        isAnalyzing={loading}
      />

      {/* 2. BODY SHELL: Sidebar (fixed 250px) + Main Content (scrolls independently) */}
      <div className="app-body-shell">
        {/* Fixed White Sidebar */}
        <Sidebar
          activeNav={activeNav}
          onSelectNav={handleNavigate}
          issuesCount={totalIssuesCount}
          fixesCount={fixesCount}
          connectedRepo={`${owner}/${repo}`}
        />

        {/* Independent Scrolling Main Content */}
        <main className="app-main-content">
          <div className="main-content-inner">
            {/* View: Issues */}
            {activeNav === 'Issues' && (
              <IssuesView
                issues={issues}
                selectedIssue={selectedIssue}
                onSelectIssue={handleSelectIssue}
                onAnalyzeIssue={handleCloneAndAnalyze}
                onNavigateTo={handleNavigate}
                owner={owner}
                repo={repo}
              />
            )}

            {/* View: Repositories */}
            {activeNav === 'Repositories' && (
              <RepositoriesView
                currentOwner={owner}
                currentRepo={repo}
                onSelectRepo={(newOwner, newRepo) => {
                  setOwner(newOwner);
                  setRepo(newRepo);
                }}
                onFetchIssues={handleFetchIssues}
                onNavigateTo={handleNavigate}
              />
            )}

            {/* View: AI Analysis */}
            {activeNav === 'AI Analysis' && (
              <AIAnalysisView
                issues={issues}
                selectedIssue={selectedIssue}
                onSelectIssue={handleSelectIssue}
                onOpenFixWorkspace={handleOpenFixWorkspace}
                onNavigateTo={handleNavigate}
                selectedModel={selectedModel}
                onFixFile={handleFixAffectedFile}
                onAcceptFileFix={handleAcceptAffectedFile}
                affectedFixes={affectedFixes}
                fixingFile={fixingFile}
                loading={loading}
                owner={owner}
                repo={repo}
                onAnalyzeIssue={handleCloneAndAnalyze}
                extractCode={extractCode}
                extractExplanation={extractExplanation}
              />
            )}

            {/* View: Fixes */}
            {activeNav === 'Fixes' && (
              <FixesView
                issues={issues}
                onSelectIssue={handleSelectIssue}
                onOpenFixWorkspace={handleOpenFixWorkspace}
                onNavigateTo={handleNavigate}
              />
            )}

            {/* View: History */}
            {activeNav === 'History' && (
              <HistoryView
                owner={owner}
                repo={repo}
                issues={issues}
              />
            )}

            {/* View: Dashboard (Default) */}
            {activeNav === 'Dashboard' && (
              <div className="dashboard-layout-container">
                {/* 1. Page Header */}
                <div className="dashboard-page-header">
                  <h1 className="dashboard-heading">AI Code Intelligence</h1>
                  <p className="dashboard-subtitle">
                    Analyze GitHub issues, understand root causes, and generate AI-assisted fixes.
                  </p>
                </div>

                {/* 2. 4 Stat Cards */}
                <StatCards
                  totalIssues={totalIssuesCount}
                  openBugs={totalIssuesCount}
                  analyzedCount={analyzedCount}
                  fixesCount={fixesCount}
                />

                {/* 3. Execution Lifecycle Pipeline */}
                <WorkflowPipeline
                  hasSelectedIssue={!!selectedIssue}
                  hasAnalyzed={!!selectedIssue?.suggestedFile}
                  hasFix={!!selectedIssue?.suggestedFix}
                  isAccepted={selectedIssue?.status === 'accepted'}
                />

                {/* 4. Execution Configuration (Full-Width Card) */}
                <RepoControlBar
                  owner={owner}
                  setOwner={setOwner}
                  repo={repo}
                  setRepo={setRepo}
                  selectedIssue={selectedIssue}
                  models={models}
                  selectedModel={selectedModel}
                  setSelectedModel={(m) => {
                    console.log('[UI] Selected model updated in App:', m);
                    setSelectedModel(m);
                  }}
                  onAnalyze={() => handleCloneAndAnalyze(selectedIssue)}
                  onFetchIssues={handleFetchIssues}
                  loading={loading}
                />

                {/* 5. Issue Workspace: Left (Issue Queue) + Right (Issue Details or Fix Workspace) */}
                <div className="issue-workspace-grid">
                  {/* Left: Issue Queue */}
                  <IssueList
                    issues={issues}
                    selectedIssue={selectedIssue}
                    onSelectIssue={handleSelectIssue}
                    onAnalyzeIssue={(issue) => handleCloneAndAnalyze(issue)}
                    onReviewFix={(issue) => handleOpenFixWorkspace(issue)}
                    owner={owner}
                    repo={repo}
                    loading={loading && issues.length === 0}
                  />

                  {/* Right: Issue Details / Fix Workspace */}
                  <div className="issue-stage-column">
                    {!selectedIssue ? (
                      <div className="empty-stage-card">
                        <div className="empty-stage-icon">
                          <SparklesIcon size={32} />
                        </div>
                        <h3 className="empty-stage-title">
                          Connect a GitHub repository to begin AI-powered issue analysis
                        </h3>
                        <p className="empty-stage-desc">
                          Select any issue from the queue on the left or click "Fetch Issues" above to start autonomous bug triage and code repair.
                        </p>
                        <button
                          className="btn-stage-fetch"
                          onClick={() => handleFetchIssues()}
                          disabled={loading}
                        >
                          <GithubIcon size={16} />
                          <span>Fetch Issues</span>
                        </button>
                      </div>
                    ) : showFixWorkspace && selectedIssue.suggestedFix ? (
                      /* Dedicated Fix Workspace View */
                      <DiffWorkspace
                        suggestedFile={selectedIssue.suggestedFile}
                        originalCode={activeOriginalCode}
                        fixedCode={activeFixedCode}
                        status={selectedIssue.status}
                        onAccept={handleTriggerAccept}
                        onReject={handleTriggerReject}
                        onReanalyze={() => handleCloneAndAnalyze(selectedIssue)}
                        onBack={() => {
                          console.log('[UI] Returning from Fix Workspace to Issue Details');
                          setShowFixWorkspace(false);
                        }}
                        loading={loading}
                      />
                    ) : (
                      /* Standard Issue Details View */
                      <div className="issue-details-stack">
                        <IssueAnalysisWorkspace
                          issue={selectedIssue}
                          suggestedFile={selectedIssue.suggestedFile}
                          rawExplanation={extractExplanation(selectedIssue.suggestedFix)}
                          modelUsed={selectedModel}
                          hasFix={!!selectedIssue.suggestedFix}
                          onReviewFix={() => setShowFixWorkspace(true)}
                        />

                        {/* Affected Files List */}
                        {selectedIssue.affectedFiles && selectedIssue.affectedFiles.length > 0 && (
                          <AffectedFiles
                            affectedFiles={selectedIssue.affectedFiles}
                            affectedFixes={affectedFixes}
                            onFixFile={handleFixAffectedFile}
                            onAcceptFileFix={handleAcceptAffectedFile}
                            fixingFile={fixingFile}
                            loading={loading}
                            extractCode={extractCode}
                            extractExplanation={extractExplanation}
                          />
                        )}

                        {/* Inline Fix Workspace if fix is generated */}
                        {selectedIssue.suggestedFix && (
                          <div className="inline-diff-section">
                            <DiffWorkspace
                              suggestedFile={selectedIssue.suggestedFile}
                              originalCode={activeOriginalCode}
                              fixedCode={activeFixedCode}
                              status={selectedIssue.status}
                              onAccept={handleTriggerAccept}
                              onReject={handleTriggerReject}
                              onReanalyze={() => handleCloneAndAnalyze(selectedIssue)}
                              onBack={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              loading={loading}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        loading={loading}
      />

      {/* AI Processing Stepped Modal */}
      <AIProcessingModal
        isOpen={aiModal.isOpen}
        statusMessage={aiModal.message}
        modelName={selectedModel}
      />

      {/* Floating Toast Notification */}
      <Toast
        message={statusMsg}
        type={toastType}
        onClose={() => setStatusMsg('')}
      />
    </div>
  );
}

export default App;
