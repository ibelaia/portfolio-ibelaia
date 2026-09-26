import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowOnHover = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 shadow-xl transition-all duration-300 ${
        glowOnHover ? 'hover:border-cyan-500/40 hover:shadow-cyan-500/10 hover:-translate-y-1' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;