// src/components/common/Loader.jsx
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const sizeClasses = {
  xs: 'h-3 w-3 border-[2px]',
  sm: 'h-4 w-4 border-[2px]',
  md: 'h-5 w-5 border-2',
  lg: 'h-6 w-6 border-2',
};

function Loader({ size = 'md', className }) {
  return (
    <span
      className={clsx(
        'inline-block animate-spin rounded-full border-t-transparent',
        'border-current',
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    />
  );
}

Loader.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Loader;
