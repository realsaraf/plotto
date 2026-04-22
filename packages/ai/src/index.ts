/**
 * Plotto AI extraction module.
 */

export const AI_PACKAGE_VERSION = '0.1.0' as const;

export {
  extractEvent,
  estimateCostCents,
  ExtractionValidationError,
  type ExtractOptions,
  type ExtractionResult,
} from './extraction';
