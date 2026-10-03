import { ClockIcon, CheckCircleIcon, SparklesIcon, GithubIcon, BugIcon } from './Icons';

export default function HistoryView({
  owner = 'axios',
  repo = 'axios',
  issues = []
}) {
  const events = [];

  events.push({
    id: 'evt-conn',
    type: 'connection',
    title: `Synchronized repository ${owner}/${repo}`,
    description: `Fetched active issue catalog and checked cloned repository integrity.`,
    time: 'Recent',
    icon: GithubIcon,
    statusClass: 'status-blue'
  });

  issues.forEach((issue) => {
    if (issue.status === 'accepted') {
      events.push({
        id: `evt-acc-${issue._id}`,
        type: 'accepted',
        title: `Applied AI fix to ${issue.suggestedFile || 'target file'}`,
        description: `Fix for Issue #${issue.number} ("${issue.title}") was accepted and written to repository disk with backup preservation.`,
        time: 'Today',
        icon: CheckCircleIcon,
        statusClass: 'status-green'
      });
    } else if (issue.suggestedFix) {
      events.push({
        id: `evt-fix-${issue._id}`,
        type: 'fix',
        title: `Synthesized code patch for Issue #${issue.number}`,
        description: `AI localized root cause and generated verified diff for ${issue.suggestedFile || 'source file'}.`,
        time: 'Today',
        icon: SparklesIcon,
        statusClass: 'status-green'
      });
    } else if (issue.suggestedFile) {
      events.push({
        id: `evt-ana-${issue._id}`,
        type: 'analysis',
        title: `Localized root cause for Issue #${issue.number}`,
        description: `Identified affected component: ${issue.suggestedFile}.`,
        time: 'Today',
        icon: BugIcon,
        statusClass: 'status-amber'
      });
    }
  });

  return (
    <div className="view-content-wrapper history-page">
      <div className="view-page-header">
        <div>
          <h1 className="view-page-title">Audit Log & History</h1>
          <p className="view-page-subtitle">
            Timeline of issue triages, AI syntheses, code modifications, and backup points.
          </p>
        </div>
        <div className="history-count-badge">
          <ClockIcon size={16} />
          <span>{events.length} System Events</span>
        </div>
      </div>

      <div className="history-timeline-list">
        {events.map((evt, idx) => {
          const Icon = evt.icon;
          return (
            <div key={evt.id || idx} className="history-timeline-row">
              <div className={`history-timeline-icon ${evt.statusClass}`}>
                <Icon size={16} />
              </div>
              <div className="history-timeline-card">
                <div className="timeline-card-header">
                  <h4 className="timeline-title-text">{evt.title}</h4>
                  <span className="timeline-time-text">{evt.time}</span>
                </div>
                <p className="timeline-desc-text">{evt.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
