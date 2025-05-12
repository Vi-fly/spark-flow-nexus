import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import React from 'react';

interface DataTableProps {
  data: any[];
  type: 'tasks' | 'contacts';
}

const DataTable: React.FC<DataTableProps> = ({ data, type }) => {
  if (!data || data.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No data available</div>;
  }

  // Determine columns based on type
  const getColumns = () => {
    if (type === 'tasks') {
      return [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' },
        { key: 'deadline', label: 'Deadline' }
      ];
    } else {
      return [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'skills', label: 'Skills' }
      ];
    }
  };
  
  const columns = getColumns();

  // Format date values
  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return '-';
    
    if (key === 'deadline' && value) {
      try {
        return new Date(value).toLocaleDateString();
      } catch (e) {
        return String(value);
      }
    }
    
    return String(value);
  };

  return (
    <div className="rounded border overflow-hidden">
      <Table>
        <TableCaption>{type === 'tasks' ? 'Tasks' : 'Contacts'} List</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className="font-medium">
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id || index}>
              {columns.map((column) => (
                <TableCell key={`${item.id || index}-${column.key}`}>
                  {formatValue(column.key, item[column.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;