import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

const MODEL_MAP = {
  'gpt-oss-120b': {
    name: 'GPT-OSS 120B',
    description: 'Advanced code reasoning & AST triage',
    badge: 'Recommended'
  },
  'qwen3.6-27b': {
    name: 'Qwen 3.6 27B',
    description: 'Fast code analysis & patch synthesis',
    badge: 'Fast'
  },
  'allam-2-7b': {
    name: 'ALLaM 2 7B',
    description: 'Lightweight analysis & parameter checking',
    badge: 'Lite'
  }
};

export default function CustomModelSelector({
  models = [],
  selectedModel = 'gpt-oss-120b',
  onSelectModel = () => {},
  size = 'default'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentMeta = MODEL_MAP[selectedModel] || {
    name: selectedModel || 'GPT-OSS 120B',
    description: 'Autonomous reasoning engine',
    badge: 'AI'
  };

  const handleSelect = (key) => {
    console.log('[UI] Model selected:', key, 'DisplayName:', MODEL_MAP[key]?.name || key);
    onSelectModel(key);
    setIsOpen(false);
  };

  // Default models list if backend models are still loading
  const modelKeys = models && models.length > 0
    ? models.map((m) => m.key)
    : ['gpt-oss-120b', 'qwen3.6-27b', 'allam-2-7b'];

  return (
    <div className={`custom-model-selector ${size}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`model-selector-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="trigger-left">
          <span className="trigger-bullet">✦</span>
          <span className="trigger-model-name">{currentMeta.name}</span>
        </div>
        <ChevronDownIcon
          size={14}
          className={`trigger-chevron ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="model-dropdown-menu" role="listbox">
          <div className="dropdown-header">
            <span className="dropdown-title">SELECT AI MODEL</span>
            <span className="dropdown-count">{modelKeys.length} available</span>
          </div>

          <div className="dropdown-options-list">
            {modelKeys.map((key) => {
              const meta = MODEL_MAP[key] || {
                name: key,
                description: 'Autonomous reasoning engine',
                badge: 'AI'
              };
              const isSelected = selectedModel === key;

              return (
                <div
                  key={key}
                  role="option"
                  aria-selected={isSelected}
                  className={`model-option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(key)}
                >
                  <div className="option-indicator-col">
                    {isSelected ? (
                      <span className="option-check-icon">✓</span>
                    ) : (
                      <span className="option-empty-dot"></span>
                    )}
                  </div>
                  <div className="option-text-col">
                    <div className="option-title-row">
                      <span className="option-name">{meta.name}</span>
                      {meta.badge && (
                        <span className={`option-badge ${meta.badge.toLowerCase()}`}>
                          {meta.badge}
                        </span>
                      )}
                    </div>
                    <span className="option-desc">{meta.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
