import React from 'react';
import { exportDrawsToCSV, downloadCSV, generateFilename, type ExportMetadata } from '../../core/melate.export';

interface ExportButtonProps {
  draws: number[][];
  metadata: ExportMetadata;
  disabled?: boolean;
}

export function ExportButton({ draws, metadata, disabled = false }: ExportButtonProps): React.JSX.Element {
  const handleExport = (): void => {
    if (draws.length === 0) {
      return;
    }
    
    try {
      // Generate CSV content
      const csvContent = exportDrawsToCSV(draws, metadata);
      
      // Generate filename
      const filename = generateFilename(metadata);
      
      // Download file
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting draws:', error);
      alert('Failed to export draws. Please try again.');
    }
  };

  const isDisabled = disabled || draws.length === 0;

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled}
      className="export-button"
      title="Export draws to CSV file"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export to CSV
    </button>
  );
}
