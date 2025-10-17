import React from 'react';

interface GenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function GenerateButton({ 
  onClick, 
  isGenerating, 
  disabled = false,
}: GenerateButtonProps): React.JSX.Element {
  return (
    <button
      className={`generate-button ${isGenerating ? 'generating' : ''}`}
      onClick={onClick}
      disabled={disabled || isGenerating}
    >
      {isGenerating ? (
        <>
          <span className="spinner"></span>
          <span>Generating...</span>
        </>
      ) : (
        <>
          <span className="button-icon">🎲</span>
          <span>Generate Numbers</span>
        </>
      )}
    </button>
  );
}
