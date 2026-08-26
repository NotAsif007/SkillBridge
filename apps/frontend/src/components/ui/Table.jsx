import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Table = ({ className, children, ...props }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
};

const Head = ({ className, children, ...props }) => {
  return (
    <thead className={cn("bg-[#F5F5F7] text-[#6E6E73] text-xs font-semibold uppercase tracking-wider", className)} {...props}>
      {children}
    </thead>
  );
};

const Body = ({ className, children, ...props }) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

const Row = ({ className, children, ...props }) => {
  return (
    <tr className={cn("border-b border-[#E5E5EA] hover:bg-[#F5F5F7]/50 transition-colors", className)} {...props}>
      {children}
    </tr>
  );
};

const Th = ({ className, children, ...props }) => {
  return (
    <th className={cn("px-4 py-3 text-left font-semibold", className)} {...props}>
      {children}
    </th>
  );
};

const Td = ({ className, children, ...props }) => {
  return (
    <td className={cn("px-4 py-3 text-[#1D1D1F]", className)} {...props}>
      {children}
    </td>
  );
};

const Empty = ({ colSpan, message = "No data available", className }) => (
  <tr>
    <td colSpan={colSpan} className={cn("px-4 py-8 text-center text-[#6E6E73]", className)}>
      {message}
    </td>
  </tr>
);

Table.Head = Head;
Table.Body = Body;
Table.Row = Row;
Table.Th = Th;
Table.Td = Td;
Table.Empty = Empty;

export default Table;
