/**
 * WellBee – Card primitive
 * A consistent bento-card wrapper used across Admin, User, Chat pages.
 */
import React from 'react';
import './Card.css';

const Card = ({ children, className = '', padding = true, ...rest }) => (
  <div className={`wb-card ${padding ? 'wb-card--padded' : ''} ${className}`.trim()} {...rest}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...rest }) => (
  <div className={`wb-card-header ${className}`.trim()} {...rest}>{children}</div>
);

export const CardTitle = ({ children, className = '', as: Tag = 'h4', ...rest }) => (
  <Tag className={`wb-card-title ${className}`.trim()} {...rest}>{children}</Tag>
);

export const CardBody = ({ children, className = '', ...rest }) => (
  <div className={`wb-card-body ${className}`.trim()} {...rest}>{children}</div>
);

export default Card;
