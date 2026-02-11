// src/components/common/Table.jsx
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Loader from './Loader';

function Table({
  columns,
  data,
  keyField = 'id',
  loading = false,
  onRowClick,
  className,
  headerClassName,
  rowClassName,
  emptyMessage = 'No data available.',
}) {
  const hasData = data && data.length > 0;

  return (
    <div className={clsx('w-full overflow-hidden rounded-lg border border-slate-200/70 bg-white/80 shadow-sm shadow-black/5 dark:border-slate-700/60 dark:bg-slate-900/80', className)}>
      <div className="max-h-[420px] overflow-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className={clsx('bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/80 dark:text-slate-400', headerClassName)}>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={clsx('px-4 py-2', col.headerClassName)}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader size="md" />
                    <span className="text-xs">Loading...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && !hasData && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!loading &&
              hasData &&
              data.map((row) => {
                const rowKey = row[keyField] ?? JSON.stringify(row);

                return (
                  <tr
                    key={rowKey}
                    className={clsx(
                      'hover:bg-slate-50/80 dark:hover:bg-slate-800/60',
                      onRowClick && 'cursor-pointer',
                      rowClassName
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => {
                      const value =
                        typeof col.render === 'function'
                          ? col.render(row[col.dataIndex], row)
                          : row[col.dataIndex];

                      return (
                        <td
                          key={col.key}
                          className={clsx(
                            'px-4 py-2 text-xs text-slate-700 dark:text-slate-200',
                            col.cellClassName
                          )}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.node.isRequired,
      dataIndex: PropTypes.string,
      render: PropTypes.func,
      headerClassName: PropTypes.string,
      cellClassName: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  keyField: PropTypes.string,
  loading: PropTypes.bool,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  rowClassName: PropTypes.string,
  emptyMessage: PropTypes.string,
};

Table.defaultProps = {
  data: [],
  keyField: 'id',
  loading: false,
  onRowClick: undefined,
  className: '',
  headerClassName: '',
  rowClassName: '',
  emptyMessage: 'No data available.',
};

export default Table;
