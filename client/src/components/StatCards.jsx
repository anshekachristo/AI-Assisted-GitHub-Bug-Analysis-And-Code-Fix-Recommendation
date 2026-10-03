import {
  BugIcon,
  SparklesIcon,
  CodeIcon,
  CheckCircleIcon
} from './Icons';

export default function StatCards({
  totalIssues = 0,
  openBugs = 0,
  analyzedCount = 0,
  fixesCount = 0
}) {
  const cards = [
    {
      id: 'total',
      label: 'TOTAL ISSUES',
      value: totalIssues,
      subtext: 'Synchronized from GitHub',
      icon: BugIcon
    },
    {
      id: 'open',
      label: 'OPEN BUGS',
      value: openBugs,
      subtext: 'Pending root cause triage',
      icon: CheckCircleIcon
    },
    {
      id: 'analyzed',
      label: 'AI ANALYZED',
      value: analyzedCount,
      subtext: 'AST graph isolated',
      icon: SparklesIcon
    },
    {
      id: 'fixes',
      label: 'AI FIXES',
      value: fixesCount,
      subtext: 'Verified patches ready',
      icon: CodeIcon
    }
  ];

  return (
    <div className="stat-cards-container">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.id} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">{c.label}</span>
              <div className="stat-card-icon">
                <Icon size={16} />
              </div>
            </div>
            <div className="stat-card-value">{c.value}</div>
            <div className="stat-card-subtext">{c.subtext}</div>
          </div>
        );
      })}
    </div>
  );
}
