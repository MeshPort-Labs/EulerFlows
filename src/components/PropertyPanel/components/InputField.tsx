import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { FormField } from './FormField';
import { cn } from '../../../lib/utils';
import { Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';

interface InputFieldProps {
  label: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'url' | 'search';
  value?: string | number;
  placeholder?: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
  tooltip?: string;
  success?: string;
  warning?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
  suffix?: string;
  prefix?: string;
  copyable?: boolean;
  externalLink?: string;
  validation?: (value: string) => { isValid: boolean; message?: string };
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  required,
  error,
  helpText,
  tooltip,
  success,
  warning,
  className,
  min,
  max,
  step,
  maxLength,
  pattern,
  autoComplete,
  suffix,
  prefix,
  copyable = false,
  externalLink,
  validation,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const stringValue = value?.toString() || '';
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;
  
  const validationResult = validation ? validation(stringValue) : { isValid: true };
  const isValid = !error && validationResult.isValid && stringValue.length > 0;
  const validationError = error || (!validationResult.isValid ? validationResult.message : undefined);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(stringValue);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExternalLink = () => {
    if (externalLink && stringValue) {
      window.open(externalLink.replace('{value}', encodeURIComponent(stringValue)), '_blank');
    }
  };

  return (
    <FormField
      label={label}
      required={required}
      error={validationError}
      helpText={helpText}
      tooltip={tooltip}
      success={success}
      warning={warning}
      className={className}
      isValid={isValid}
    >
      <div className="relative">
        {prefix && (
          <div 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm pointer-events-none"
            style={{ color: 'var(--panel-text-muted)' }}
          >
            {prefix}
          </div>
        )}
        
        <Input
          type={inputType}
          value={stringValue}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          pattern={pattern}
          autoComplete={autoComplete}
          className={cn(
            "transition-all duration-200",
            prefix && "pl-8",
            (suffix || isPasswordType || copyable || externalLink) && "pr-10",
            validationError && "border-destructive focus:border-destructive",
            isValid && "border-green-500",
            isFocused && "shadow-[0_0_0_2px_color-mix(in_srgb,var(--ring)_20%,transparent)]"
          )}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {suffix && (
            <span 
              className="text-sm pointer-events-none"
              style={{ color: 'var(--panel-text-muted)' }}
            >
              {suffix}
            </span>
          )}
          
          {copyable && stringValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          
          {externalLink && stringValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleExternalLink}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
          
          {isPasswordType && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        
        {maxLength && type === 'text' && (
          <div 
            className="absolute -bottom-5 right-0 text-xs"
            style={{ color: 'var(--panel-text-muted)' }}
          >
            {stringValue.length}/{maxLength}
          </div>
        )}
      </div>
    </FormField>
  );
};