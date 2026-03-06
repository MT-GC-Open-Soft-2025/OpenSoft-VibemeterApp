/**
 * WellBee – Spinner / loading indicator
 * size: 'sm' | 'md' | 'lg'
 */
import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'md', className = '', label = 'Loading…' }) => (
  <div className={`wb-spinner wb-spinner--${size} ${className}`.trim()} role="status" aria-label={label}>
    <span className="wb-spinner-inner" />
    <span className="visually-hidden">{label}</span>
  </div>
);

export const FullPageSpinner = () => (
  <div className="wb-spinner-fullpage">
    <Spinner size="lg" />
  </div>
);

export default Spinner;
