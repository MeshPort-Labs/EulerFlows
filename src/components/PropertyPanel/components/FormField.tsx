import React from 'react';
import { Label } from '../../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { Alert, AlertDescription } from '../../ui/alert';
import { cn } from '../../../lib/utils';
import { HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  tooltip?: string;
  success?: string;
  warning?: string;
  className?: string;
  children: React.ReactNode;
  isValid?: boolean;
  showValidation?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helpText,
  tooltip,
  success,
  warning,
  className,
  children,
  isValid,
  showValidation = true,
}) => {
  const getValidationIcon = () => {
    if (!showValidation) return null;
    
    if (error) {
      return <AlertCircle className="w-3 h-3 text-destructive" />;
    }
    
    if (isValid) {
      return <CheckCircle2 className="w-3 h-3 text-green-500" />;
    }
    
    return null;
  };

  return (
    <div className={cn('space-y-2', className)} style={{ marginBottom: '1rem' }}>
      <div className="flex items-center gap-2">
        <Label 
          className="text-sm flex items-center gap-1"
          style={{ 
            color: 'var(--panel-text)',
            fontWeight: '500'
          }}
        >
          {label}
          {required && <span className="text-destructive">*</span>}
          {getValidationIcon()}
        </Label>
        
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="outline-none">
                  <HelpCircle className="w-3 h-3" style={{ color: 'var(--panel-text-muted)' }} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="property-panel-field">
        {children}
      </div>
      
      <div className="space-y-1">
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {warning && !error && (
          <Alert className="py-2 border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-3 w-3 text-yellow-600" />
            <AlertDescription className="text-xs text-yellow-700">
              {warning}
            </AlertDescription>
          </Alert>
        )}
        
        {success && !error && !warning && (
          <Alert className="py-2 border-green-500 bg-green-50">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <AlertDescription className="text-xs text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}
        
        {helpText && !error && !warning && !success && (
          <p className="text-xs" style={{ color: 'var(--panel-text-muted)' }}>
            {helpText}
          </p>
        )}
      </div>
    </div>
  );
};