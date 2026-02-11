// src/components/dashboard/StatusCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

function StatusCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default', // 'default' | 'success' | 'warning' | 'danger'
  trend, // { direction: 'up' | 'down' | 'flat', value: string }
  className,
}) {
  const VariantClasses = {
    default:
      'border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90',
    success:
      'border-emerald-200/80 bg-emerald-50/90 dark:border-emerald-900/70 dark:bg-emerald-950/80',
    warning:
      'border-amber-200/80 bg-amber-50/90 dark:border-amber-900/70 dark:bg-amber-950/80',
    danger:
      'border-red-200/80 bg-red-50/90 dark:border-red-900/70 dark:bg-red-950/80',
  };

  const iconBg = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800/90 dark:text-slate-100',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/90 dark:text-emerald-100',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/90 dark:text-amber-100',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/90 dark:text-red-100',
  }[variant];

  const trendColor =
    trend?.direction === 'up'
      ? 'text-emerald-500'
      : trend?.direction === 'down'
      ? 'text-red-500'
      : 'text-slate-400';

  const TrendArrow = () => {
    if (!trend) return null;
    if (trend.direction === 'up') return <span>▲</span>;
    if (trend.direction === 'down') return <span>▼</span>;
    return <span>⟷</span>;
  };

  return (
    <div
      className={clsx(
        'flex flex-col rounded-2xl border p-3 shadow-sm shadow-black/5 backdrop-blur-md',
        VariantClasses[variant],
        className
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {title}
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
            {value ?? '—'}
          </div>
        </div>
        {icon && (
          <div
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-xl shadow-sm',
              iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="truncate">{subtitle}</span>
        {trend && (
          <span className={clsx('flex items-center gap-1 font-medium', trendColor)}>
            <TrendArrow />
            <span>{trend.value}</span>
          </span>
        )}
      </div>
    </div>
  );
}

StatusCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger']),
  trend: PropTypes.shape({
    direction: PropTypes.oneOf(['up', 'down', 'flat']).isRequired,
    value: PropTypes.string.isRequired,
  }),
  className: PropTypes.string,
};

export default StatusCard;
