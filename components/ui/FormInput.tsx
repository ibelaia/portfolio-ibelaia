'use client';

import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function FormInput({ label, error, className = '', ...props }: FormInputProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors ${
          error ? 'border-rose-500/50 focus:border-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}