import React, { useState, useRef } from 'react';
import { parseCSV, type DrawRecord } from '../../core/melate.export';

interface ValidationPanelProps {
  onImportDraws: (draws: DrawRecord[]) => void;
  onValidate: (actualResults: number[]) => void;
  hasImportedDraws: boolean;
}

function validateNumbers(input: string): { valid: boolean; numbers?: number[]; error?: string } {
  const numbers = input
    .split(/[,\s|]+/)
    .map(n => n.trim())
    .filter(n => n !== '')
    .map(n => parseInt(n, 10));

  if (numbers.length !== 6) {
    return { valid: false, error: 'Please enter exactly 6 numbers' };
  }

  if (numbers.some(n => isNaN(n) || n < 1 || n > 49)) {
    return { valid: false, error: 'All numbers must be between 1 and 49' };
  }

  if (new Set(numbers).size !== 6) {
    return { valid: false, error: 'Numbers must be unique' };
  }

  return { valid: true, numbers: numbers.sort((a, b) => a - b) };
}

interface FileImportSectionProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  importedFileName: string;
  importError: string;
  hasImportedDraws: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

function FileImportSection({ fileInputRef, importedFileName, importError, hasImportedDraws, onFileChange, onClear }: FileImportSectionProps): React.ReactElement {
  return (
    <div className="validation-section">
      <h3>Step 1: Import Your Draws</h3>
      <p className="help-text">Upload a previously exported CSV file</p>
      
      <div className="file-import-container">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={onFileChange}
          className="file-input"
          id="csv-file-input"
        />
        <label htmlFor="csv-file-input" className="file-input-label">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {importedFileName || 'Choose CSV file'}
        </label>
        
        {importedFileName && (
          <button onClick={onClear} className="clear-import-btn" title="Clear import">
            ✕
          </button>
        )}
      </div>

      {importError && <div className="error-message">{importError}</div>}
      {hasImportedDraws && !importError && (
        <div className="success-message">✓ Draws imported successfully</div>
      )}
    </div>
  );
}

interface ValidationInputSectionProps {
  actualNumbers: string;
  validationError: string;
  onNumbersChange: (value: string) => void;
  onValidate: () => void;
}

function ValidationInputSection({ actualNumbers, validationError, onNumbersChange, onValidate }: ValidationInputSectionProps): React.ReactElement {
  return (
    <div className="validation-section">
      <h3>Step 2: Enter Actual Results</h3>
      <p className="help-text">Enter the 6 winning numbers from the official draw (separated by commas, spaces, or pipes)</p>
      
      <div className="validation-input-container">
        <input
          type="text"
          value={actualNumbers}
          onChange={(e) => onNumbersChange(e.target.value)}
          placeholder="e.g., 5, 12, 23, 34, 41, 49"
          className="validation-input"
        />
        <button 
          onClick={onValidate} 
          className="validate-btn"
          disabled={!actualNumbers.trim()}
        >
          Validate
        </button>
      </div>

      {validationError && <div className="error-message">{validationError}</div>}
    </div>
  );
}

export function ValidationPanel({ onImportDraws, onValidate, hasImportedDraws }: ValidationPanelProps): React.ReactElement {
  const [actualNumbers, setActualNumbers] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [importedFileName, setImportedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e): void => {
      try {
        const content = e.target?.result as string;
        const draws = parseCSV(content);
        
        if (draws.length === 0) {
          setImportError('No valid draws found in CSV file');
          return;
        }

        onImportDraws(draws);
        setImportError('');
      } catch (error) {
        setImportError(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    reader.onerror = (): void => {
      setImportError('Failed to read file');
    };

    reader.readAsText(file);
  };

  const handleValidate = (): void => {
    setValidationError('');

    const result = validateNumbers(actualNumbers);
    
    if (!result.valid || !result.numbers) {
      setValidationError(result.error ?? 'Invalid numbers');
      return;
    }

    onValidate(result.numbers);
    setValidationError('');
  };

  const handleClearImport = (): void => {
    setImportedFileName('');
    setImportError('');
    setActualNumbers('');
    setValidationError('');
    onImportDraws([]); // Notify parent to clear imported draws
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="validation-panel">
      <h2>🎯 Validate Your Draws</h2>
      
      <FileImportSection
        fileInputRef={fileInputRef}
        importedFileName={importedFileName}
        importError={importError}
        hasImportedDraws={hasImportedDraws}
        onFileChange={handleFileImport}
        onClear={handleClearImport}
      />

      {hasImportedDraws && (
        <ValidationInputSection
          actualNumbers={actualNumbers}
          validationError={validationError}
          onNumbersChange={setActualNumbers}
          onValidate={handleValidate}
        />
      )}

      <div className="validation-instructions">
        <h4>How it works:</h4>
        <ol>
          <li>Import a CSV file you previously exported from this app</li>
          <li>Enter the actual winning numbers from the lottery draw</li>
          <li>Click "Validate" to see which of your draws matched</li>
          <li>View statistics on your best draws and total prizes</li>
        </ol>
      </div>
    </div>
  );
}
