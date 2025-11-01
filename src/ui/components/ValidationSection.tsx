import React from 'react';
import { ValidationPanel } from './ValidationPanel';
import { ValidationResults } from './ValidationResults';
import type { DrawRecord, ValidationResult } from '../../core/melate.export';

interface ValidationSectionProps {
  importedDraws: DrawRecord[];
  validationResults: ValidationResult[];
  actualNumbers: number[];
  onImportDraws: (draws: DrawRecord[]) => void;
  onValidate: (numbers: number[]) => void;
}

export function ValidationSection({
  importedDraws,
  validationResults,
  actualNumbers,
  onImportDraws,
  onValidate,
}: ValidationSectionProps): React.ReactElement {
  return (
    <>
      <div className="section-panel">
        <ValidationPanel
          onImportDraws={onImportDraws}
          onValidate={onValidate}
          hasImportedDraws={importedDraws.length > 0}
        />
      </div>
      
      {validationResults.length > 0 && actualNumbers.length > 0 && (
        <div className="section-panel">
          <ValidationResults
            results={validationResults}
            actualNumbers={actualNumbers}
          />
        </div>
      )}
    </>
  );
}
