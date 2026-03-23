import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Loader2,
  AlertCircle,
  Save,
  FileJson,
  FormInput,
} from 'lucide-react';

export interface HITLActionContent {
  title: string;
  sections: Array<{
    heading: string;
    content?: string;
    bullets?: string[];
  }>;
}

export interface AgentStep {
  id: string;
  title: string;
  description: string;
  tools: string[];
  dataUsed: string[];
  successCriteria: string;
  requiresHITL: boolean;
  hitlMessage?: string;
  hitlActionContent?: HITLActionContent;
  duration: number;
}

export interface ScenarioBenefits {
  timeSaved: string;
  impactMetric: string;
}

export interface Scenario {
  id: string;
  title: string;
  function: string;
  description: string;
  problem: string;
  icon: string;
  difficulty: string;
  estimatedTime: string;
  oldWayTime?: string;
  oldWaySteps?: string[];
  steps: AgentStep[];
  benefits: ScenarioBenefits;
  learningModules: string[];
  flagship: boolean;
  active: boolean;
  hidden: boolean;
}

interface Props {
  scenario: Scenario | null;
  onClose: () => void;
  onSave: (scenario: Scenario, isNew: boolean) => Promise<void>;
}

const FUNCTIONS = ['Commercial', 'Supply Chain', 'Finance', 'HR', 'Legal', 'IT & Marketing', 'Other'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const ICONS = [
  'ShieldCheck',
  'AlertTriangle',
  'DollarSign',
  'Users',
  'Scale',
  'FileText',
  'TrendingUp',
  'Package',
  'Settings',
  'Target',
];

function createEmptyStep(): AgentStep {
  return {
    id: `step-${Date.now()}`,
    title: '',
    description: '',
    tools: [],
    dataUsed: [],
    successCriteria: '',
    requiresHITL: false,
    duration: 5,
  };
}

function createEmptyScenario(): Scenario {
  return {
    id: '',
    title: '',
    function: 'Commercial',
    description: '',
    problem: '',
    icon: 'FileText',
    difficulty: 'Intermediate',
    estimatedTime: '3 min',
    oldWayTime: '',
    oldWaySteps: [],
    steps: [createEmptyStep()],
    benefits: { timeSaved: '', impactMetric: '' },
    learningModules: [],
    flagship: false,
    active: false,
    hidden: false,
  };
}

function StepEditor({
  step,
  index,
  onChange,
  onDelete,
  canDelete,
}: {
  step: AgentStep;
  index: number;
  onChange: (step: AgentStep) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  const updateField = <K extends keyof AgentStep>(field: K, value: AgentStep[K]) => {
    onChange({ ...step, [field]: value });
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-gray-300" />
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm font-semibold text-gray-700">
            Step {index + 1}: {step.title || '(untitled)'}
          </span>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Step ID</label>
              <input
                type="text"
                value={step.id}
                onChange={(e) => updateField('id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                placeholder="step-1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration (seconds)</label>
              <input
                type="number"
                value={step.duration}
                onChange={(e) => updateField('duration', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={step.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
              placeholder="Step title"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={step.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20 resize-none"
              placeholder="What happens in this step"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tools (comma-separated)</label>
              <input
                type="text"
                value={step.tools.join(', ')}
                onChange={(e) =>
                  updateField(
                    'tools',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                placeholder="Tool A, Tool B"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Data Used (comma-separated)</label>
              <input
                type="text"
                value={step.dataUsed.join(', ')}
                onChange={(e) =>
                  updateField(
                    'dataUsed',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                placeholder="Data source A, Data source B"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Success Criteria</label>
            <input
              type="text"
              value={step.successCriteria}
              onChange={(e) => updateField('successCriteria', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
              placeholder="What defines success for this step"
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={step.requiresHITL}
                onChange={(e) => updateField('requiresHITL', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#F40009] focus:ring-[#F40009]"
              />
              <span className="text-sm text-gray-700">Requires Human-in-the-Loop (HITL)</span>
            </label>

            {step.requiresHITL && (
              <div className="mt-3 ml-6 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">HITL Message</label>
                  <input
                    type="text"
                    value={step.hitlMessage || ''}
                    onChange={(e) => updateField('hitlMessage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                    placeholder="Message to show when human approval is needed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    HITL Action Content (JSON)
                  </label>
                  <textarea
                    value={step.hitlActionContent ? JSON.stringify(step.hitlActionContent, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        const parsed = e.target.value ? JSON.parse(e.target.value) : undefined;
                        updateField('hitlActionContent', parsed);
                      } catch {
                        // Invalid JSON, keep current value
                      }
                    }}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#F40009]/20 resize-none"
                    placeholder='{"title": "...", "sections": [...]}'
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type EditMode = 'form' | 'json';

// Schema validation
const REQUIRED_SCENARIO_KEYS = ['id', 'title', 'function', 'description', 'problem', 'icon', 'difficulty', 'estimatedTime', 'steps', 'benefits', 'learningModules'];
const OPTIONAL_SCENARIO_KEYS = ['oldWayTime', 'oldWaySteps', 'flagship', 'active', 'hidden'];
const ALL_SCENARIO_KEYS = new Set([...REQUIRED_SCENARIO_KEYS, ...OPTIONAL_SCENARIO_KEYS]);

// Known icon component names that should be converted to strings
const KNOWN_ICONS = ['Users', 'ShieldCheck', 'AlertTriangle', 'DollarSign', 'Scale', 'FileText', 'TrendingUp', 'Package', 'Settings', 'Target', 'Factory', 'Laptop', 'Camera', 'Search', 'HelpCircle'];

/**
 * Convert JavaScript object notation (from Figma/code) to valid JSON.
 * Handles: unquoted keys, single quotes, bare identifiers like `icon: Users`
 */
function parseJsObjectToJson(input: string): string {
  let result = input.trim();

  // Remove trailing comma before closing brackets (common in JS)
  result = result.replace(/,(\s*[}\]])/g, '$1');

  // Replace bare icon identifiers with quoted strings (e.g., `icon: Users` -> `icon: "Users"`)
  for (const icon of KNOWN_ICONS) {
    // Match: key: IconName (not already quoted)
    const iconRegex = new RegExp(`(:\\s*)${icon}(\\s*[,}\\]])`, 'g');
    result = result.replace(iconRegex, `$1"${icon}"$2`);
  }

  // Replace single quotes with double quotes
  // But be careful with apostrophes inside strings
  result = result.replace(/'/g, '"');

  // Add quotes around unquoted keys
  // Match: word followed by colon (not inside a string)
  result = result.replace(/(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

  // Handle the first key in the object (no comma before it)
  result = result.replace(/^\s*\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '{"$1":');

  return result;
}

const REQUIRED_STEP_KEYS = ['id', 'title', 'description', 'tools', 'dataUsed', 'successCriteria', 'requiresHITL', 'duration'];
const OPTIONAL_STEP_KEYS = ['hitlMessage', 'hitlActionContent'];
const ALL_STEP_KEYS = new Set([...REQUIRED_STEP_KEYS, ...OPTIONAL_STEP_KEYS]);

const REQUIRED_BENEFITS_KEYS = ['timeSaved', 'impactMetric'];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateScenarioJson(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { valid: false, errors: ['Root must be an object'], warnings: [] };
  }

  const obj = data as Record<string, unknown>;

  // Check required keys
  for (const key of REQUIRED_SCENARIO_KEYS) {
    if (!(key in obj)) {
      errors.push(`Missing required field: "${key}"`);
    }
  }

  // Check for unknown keys
  for (const key of Object.keys(obj)) {
    if (!ALL_SCENARIO_KEYS.has(key)) {
      warnings.push(`Unknown field: "${key}"`);
    }
  }

  // Validate types
  if ('id' in obj && typeof obj.id !== 'string') errors.push('"id" must be a string');
  if ('title' in obj && typeof obj.title !== 'string') errors.push('"title" must be a string');
  if ('function' in obj && typeof obj.function !== 'string') errors.push('"function" must be a string');
  if ('description' in obj && typeof obj.description !== 'string') errors.push('"description" must be a string');
  if ('problem' in obj && typeof obj.problem !== 'string') errors.push('"problem" must be a string');
  if ('icon' in obj && typeof obj.icon !== 'string') errors.push('"icon" must be a string');
  if ('difficulty' in obj && typeof obj.difficulty !== 'string') errors.push('"difficulty" must be a string');
  if ('estimatedTime' in obj && typeof obj.estimatedTime !== 'string') errors.push('"estimatedTime" must be a string');
  if ('oldWayTime' in obj && obj.oldWayTime !== undefined && typeof obj.oldWayTime !== 'string') errors.push('"oldWayTime" must be a string');
  if ('oldWaySteps' in obj && !Array.isArray(obj.oldWaySteps)) errors.push('"oldWaySteps" must be an array');
  if ('learningModules' in obj && !Array.isArray(obj.learningModules)) errors.push('"learningModules" must be an array');
  if ('flagship' in obj && typeof obj.flagship !== 'boolean') errors.push('"flagship" must be a boolean');
  if ('active' in obj && typeof obj.active !== 'boolean') errors.push('"active" must be a boolean');
  if ('hidden' in obj && typeof obj.hidden !== 'boolean') errors.push('"hidden" must be a boolean');

  // Validate benefits
  if ('benefits' in obj) {
    if (typeof obj.benefits !== 'object' || obj.benefits === null) {
      errors.push('"benefits" must be an object');
    } else {
      const benefits = obj.benefits as Record<string, unknown>;
      for (const key of REQUIRED_BENEFITS_KEYS) {
        if (!(key in benefits)) {
          errors.push(`Missing required field in benefits: "${key}"`);
        }
      }
    }
  }

  // Validate steps array
  if ('steps' in obj) {
    if (!Array.isArray(obj.steps)) {
      errors.push('"steps" must be an array');
    } else if (obj.steps.length === 0) {
      errors.push('"steps" must have at least one step');
    } else {
      obj.steps.forEach((step, index) => {
        if (typeof step !== 'object' || step === null) {
          errors.push(`Step ${index + 1}: must be an object`);
          return;
        }
        const stepObj = step as Record<string, unknown>;

        // Check required step keys
        for (const key of REQUIRED_STEP_KEYS) {
          if (!(key in stepObj)) {
            errors.push(`Step ${index + 1}: missing required field "${key}"`);
          }
        }

        // Check for unknown step keys
        for (const key of Object.keys(stepObj)) {
          if (!ALL_STEP_KEYS.has(key)) {
            warnings.push(`Step ${index + 1}: unknown field "${key}"`);
          }
        }

        // Validate step types
        if ('tools' in stepObj && !Array.isArray(stepObj.tools)) {
          errors.push(`Step ${index + 1}: "tools" must be an array`);
        }
        if ('dataUsed' in stepObj && !Array.isArray(stepObj.dataUsed)) {
          errors.push(`Step ${index + 1}: "dataUsed" must be an array`);
        }
        if ('requiresHITL' in stepObj && typeof stepObj.requiresHITL !== 'boolean') {
          errors.push(`Step ${index + 1}: "requiresHITL" must be a boolean`);
        }
        if ('duration' in stepObj && typeof stepObj.duration !== 'number') {
          errors.push(`Step ${index + 1}: "duration" must be a number`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function ScenarioEditModal({ scenario, onClose, onSave }: Props) {
  const isNew = scenario === null;
  const [form, setForm] = useState<Scenario>(scenario || createEmptyScenario());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mode toggle
  const [editMode, setEditMode] = useState<EditMode>('form');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonValidation, setJsonValidation] = useState<ValidationResult>({ valid: true, errors: [], warnings: [] });

  // Sync JSON text when switching to JSON mode
  useEffect(() => {
    if (editMode === 'json') {
      const json = JSON.stringify(form, null, 2);
      setJsonText(json);
      setJsonError(null);
      // Validate the form data
      const validation = validateScenarioJson(form);
      setJsonValidation(validation);
    }
  }, [editMode]);

  // Initialize JSON text on mount
  useEffect(() => {
    const json = JSON.stringify(form, null, 2);
    setJsonText(json);
    const validation = validateScenarioJson(form);
    setJsonValidation(validation);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, saving]);

  const updateField = <K extends keyof Scenario>(field: K, value: Scenario[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleModeSwitch = (newMode: EditMode) => {
    if (newMode === editMode) return;

    if (newMode === 'form' && editMode === 'json') {
      // Switching from JSON to Form - try to parse JSON
      try {
        const parsed = JSON.parse(jsonText);
        const validation = validateScenarioJson(parsed);
        if (!validation.valid) {
          setJsonError('Fix schema errors before switching to form view.');
          setJsonValidation(validation);
          return;
        }
        setForm(parsed);
        setJsonError(null);
        setJsonValidation(validation);
        setEditMode('form');
      } catch {
        setJsonError('Invalid JSON syntax. Fix errors before switching to form view.');
      }
    } else {
      // Switching from Form to JSON
      const json = JSON.stringify(form, null, 2);
      setJsonText(json);
      setJsonError(null);
      const validation = validateScenarioJson(form);
      setJsonValidation(validation);
      setEditMode('json');
    }
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setJsonError(null);
      // Perform schema validation
      const validation = validateScenarioJson(parsed);
      setJsonValidation(validation);
    } catch {
      setJsonError('Invalid JSON syntax');
      setJsonValidation({ valid: false, errors: [], warnings: [] });
    }
  };

  const handleParseJsObject = () => {
    try {
      // First try to parse as-is (maybe it's already valid JSON)
      JSON.parse(jsonText);
      // Already valid JSON, no conversion needed
      return;
    } catch {
      // Not valid JSON, try to convert from JS object notation
    }

    try {
      const converted = parseJsObjectToJson(jsonText);
      // Try to parse the converted result
      const parsed = JSON.parse(converted);
      // Format it nicely
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setJsonError(null);
      const validation = validateScenarioJson(parsed);
      setJsonValidation(validation);
    } catch (err) {
      setJsonError('Could not parse as JavaScript object. Check syntax.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let dataToSave: Scenario;

    if (editMode === 'json') {
      // Parse and validate JSON before saving
      try {
        dataToSave = JSON.parse(jsonText);
      } catch {
        setError('Invalid JSON syntax. Please fix errors.');
        return;
      }

      const validation = validateScenarioJson(dataToSave);
      if (!validation.valid) {
        setError(`Schema validation failed: ${validation.errors[0]}`);
        return;
      }
    } else {
      dataToSave = form;

      // Basic validation for form mode
      if (!dataToSave.id?.trim()) {
        setError('Scenario ID is required');
        return;
      }
      if (!dataToSave.title?.trim()) {
        setError('Title is required');
        return;
      }
      if (!dataToSave.steps?.length) {
        setError('At least one step is required');
        return;
      }
    }

    setSaving(true);
    try {
      await onSave(dataToSave, isNew);
    } catch (err: any) {
      setError(err.message || 'Failed to save scenario');
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, createEmptyStep()],
    }));
  };

  const updateStep = (index: number, step: AgentStep) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === index ? step : s)),
    }));
  };

  const deleteStep = (index: number) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ animation: 'fadeSlideIn 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isNew ? 'Create Scenario' : 'Edit Scenario'}
            </h2>
            <p className="text-sm text-gray-500">
              {isNew ? 'Add a new AI adventure scenario' : `Editing: ${scenario?.title}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleModeSwitch('form')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  editMode === 'form'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FormInput className="w-3.5 h-3.5" />
                Form
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  editMode === 'json'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                JSON
              </button>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {editMode === 'json' ? (
              /* JSON Editor */
              <div className="space-y-3">
                {/* Syntax Error */}
                {jsonError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {jsonError}
                  </div>
                )}

                {/* Schema Validation Errors */}
                {!jsonError && jsonValidation.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <p className="text-sm font-medium text-red-700 mb-1">Schema Errors ({jsonValidation.errors.length})</p>
                    <ul className="text-xs text-red-600 space-y-0.5 max-h-32 overflow-y-auto">
                      {jsonValidation.errors.map((err, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-red-400 mt-0.5">•</span>
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Schema Validation Warnings */}
                {!jsonError && jsonValidation.warnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <p className="text-sm font-medium text-amber-700 mb-1">Warnings ({jsonValidation.warnings.length})</p>
                    <ul className="text-xs text-amber-600 space-y-0.5 max-h-24 overflow-y-auto">
                      {jsonValidation.warnings.map((warn, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-amber-400 mt-0.5">•</span>
                          {warn}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Valid JSON indicator */}
                {!jsonError && jsonValidation.valid && jsonText.trim() && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Valid JSON schema
                  </div>
                )}

                <div className="relative">
                  <textarea
                    value={jsonText}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className={`w-full h-[55vh] px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 resize-none ${
                      jsonError || jsonValidation.errors.length > 0
                        ? 'border-red-300 focus:ring-red-200'
                        : jsonValidation.warnings.length > 0
                        ? 'border-amber-300 focus:ring-amber-200'
                        : 'border-gray-200 focus:ring-[#F40009]/20'
                    }`}
                    placeholder="Paste your scenario JSON here..."
                    spellCheck={false}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Paste or edit the full scenario JSON. Schema validation checks required fields and types.
                  </p>
                  <button
                    type="button"
                    onClick={handleParseJsObject}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                    title="Convert JavaScript object notation (from Figma) to valid JSON"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    Parse JS Object
                  </button>
                </div>
              </div>
            ) : (
              /* Form Editor */
              <>
                {/* Basic Info */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Scenario ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.id}
                        onChange={(e) => updateField('id', e.target.value)}
                        disabled={!isNew}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20 disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="commercial-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                        placeholder="Scenario Title"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Function</label>
                      <select
                        value={form.function}
                        onChange={(e) => updateField('function', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                      >
                        {FUNCTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                      <select
                        value={form.difficulty}
                        onChange={(e) => updateField('difficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                      >
                        {DIFFICULTIES.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                      <select
                        value={form.icon}
                        onChange={(e) => updateField('icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                      >
                        {ICONS.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20 resize-none"
                      placeholder="Brief description of the scenario"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Problem Statement</label>
                    <textarea
                      value={form.problem}
                      onChange={(e) => updateField('problem', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20 resize-none"
                      placeholder="What problem does this scenario address"
                    />
                  </div>
                </section>

                {/* Timing */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Timing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Time (AI way)</label>
                      <input
                        type="text"
                        value={form.estimatedTime}
                        onChange={(e) => updateField('estimatedTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                        placeholder="3 min"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Old Way Time (manual)</label>
                      <input
                        type="text"
                        value={form.oldWayTime || ''}
                        onChange={(e) => updateField('oldWayTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                        placeholder="45-60 min"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Old Way Steps (one per line)
                    </label>
                    <textarea
                      value={(form.oldWaySteps || []).join('\n')}
                      onChange={(e) =>
                        updateField(
                          'oldWaySteps',
                          e.target.value.split('\n').filter((s) => s.trim())
                        )
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20 resize-none"
                      placeholder="Step 1&#10;Step 2&#10;Step 3"
                    />
                  </div>
                </section>

                {/* Steps */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Agent Steps <span className="text-red-500">*</span>
                    </h3>
                    <button
                      type="button"
                      onClick={addStep}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#F40009] hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Step
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.steps.map((step, index) => (
                      <StepEditor
                        key={step.id}
                        step={step}
                        index={index}
                        onChange={(updated) => updateStep(index, updated)}
                        onDelete={() => deleteStep(index)}
                        canDelete={form.steps.length > 1}
                      />
                    ))}
                  </div>
                </section>

                {/* Benefits */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Benefits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Time Saved</label>
                      <input
                        type="text"
                        value={form.benefits.timeSaved}
                        onChange={(e) =>
                          updateField('benefits', { ...form.benefits, timeSaved: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                        placeholder="42-57 min"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Impact Metric</label>
                      <input
                        type="text"
                        value={form.benefits.impactMetric}
                        onChange={(e) =>
                          updateField('benefits', { ...form.benefits, impactMetric: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                        placeholder="24 retailers checked - $8.4K leak found"
                      />
                    </div>
                  </div>
                </section>

                {/* Learning Modules */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Learning Modules</h3>
                  <input
                    type="text"
                    value={form.learningModules.join(', ')}
                    onChange={(e) =>
                      updateField(
                        'learningModules',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                    placeholder="Module A, Module B"
                  />
                </section>

                {/* Flags */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Flags</h3>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => updateField('active', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#F40009] focus:ring-[#F40009]"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.flagship}
                        onChange={(e) => updateField('flagship', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#F40009] focus:ring-[#F40009]"
                      />
                      <span className="text-sm text-gray-700">Flagship</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.hidden}
                        onChange={(e) => updateField('hidden', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#F40009] focus:ring-[#F40009]"
                      />
                      <span className="text-sm text-gray-700">Hidden</span>
                    </label>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (editMode === 'json' && (!!jsonError || !jsonValidation.valid))}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#F40009] hover:bg-[#DC0012] rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isNew ? 'Create Scenario' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
