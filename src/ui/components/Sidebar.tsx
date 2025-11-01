import React from 'react';

export type SidebarSection = 'generator' | 'statistics' | 'validation';

interface SidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  hasHistoricalData: boolean;
}

export function Sidebar({ activeSection, onSectionChange, hasHistoricalData }: SidebarProps): React.ReactElement {
  const sections = [
    {
      id: 'generator' as SidebarSection,
      label: 'Generator',
      icon: '🎲',
      description: 'Generate lottery numbers',
      available: true,
    },
    {
      id: 'statistics' as SidebarSection,
      label: 'Statistics',
      icon: '📊',
      description: 'View number frequency',
      available: hasHistoricalData,
    },
    {
      id: 'validation' as SidebarSection,
      label: 'Validation',
      icon: '🎯',
      description: 'Validate your draws',
      available: true,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Melate</h2>
        <p className="sidebar-subtitle">Lottery Generator</p>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`sidebar-item ${activeSection === section.id ? 'active' : ''} ${!section.available ? 'disabled' : ''}`}
            disabled={!section.available}
            title={!section.available ? 'Load game data first' : section.description}
          >
            <span className="sidebar-item-icon">{section.icon}</span>
            <div className="sidebar-item-content">
              <span className="sidebar-item-label">{section.label}</span>
              <span className="sidebar-item-description">{section.description}</span>
            </div>
            {!section.available && (
              <span className="sidebar-item-badge">Locked</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">Powered by AI & TypeScript ✨</p>
      </div>
    </aside>
  );
}
