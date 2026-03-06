/**
 * WellBee – Button primitive
 * variant: 'primary' | 'outline' | 'ghost' | 'danger' | 'warning'
 * size:    'sm' | 'md' | 'lg'
 */
import React from 'react';
import './Button.css';

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  type = 'button',
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`wb-btn wb-btn--${variant} wb-btn--${size} ${disabled ? 'wb-btn--disabled' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
