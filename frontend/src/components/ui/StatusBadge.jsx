/**
 * WellBee – StatusBadge
 * Renders a colored pill badge. Covers agent status, vibe tiers, card labels.
 * variant: 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'teal' | 'purple' | 'gold'
 */
import React from 'react';
import './StatusBadge.css';

const STATUS_VARIANTS = {
  success: { bg: 'var(--wb-success-bg)',  color: 'var(--wb-success)' },
  warning: { bg: 'var(--wb-warning-bg)',  color: '#92400e' },
  danger:  { bg: 'var(--wb-danger-bg)',   color: 'var(--wb-danger)' },
  info:    { bg: 'var(--wb-info-bg)',      color: 'var(--wb-info)' },
  muted:   { bg: 'rgba(148,163,184,0.12)', color: 'var(--wb-muted)' },
  teal:    { bg: 'rgba(15,118,110,0.1)',   color: 'var(--wb-teal)' },
  purple:  { bg: 'rgba(168,85,247,0.1)',   color: '#a855f7' },
  gold:    { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
};

const StatusBadge = ({ variant = 'muted', children, style, className = '', ...rest }) => {
  const styles = STATUS_VARIANTS[variant] || STATUS_VARIANTS.muted;
  return (
    <span
      className={`wb-badge ${className}`.trim()}
      style={{ background: styles.bg, color: styles.color, ...style }}
      {...rest}
    >
      {children}
    </span>
  );
};

export default StatusBadge;
