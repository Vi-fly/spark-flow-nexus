
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { databaseConnector } from '@/utils/databaseConnector';
import { 
  Database, 
  Table as TableIcon, 
  FileDown, 
  FileUp, 
  Filter, 
  MoreHorizontal, 
  Search, 
  RefreshCw, 
  Download,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  BarChart3,
  ArrowUpDown
} from 'lucide-react';

// Sample data structure for the demo
interface TableInfo {
  name: string;
  count: number;
  lastUpdated: string;
  fields: string[];
}

interface TableData {
  [key: string]: any[];
}

const Data = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterField, setFilterField] = useState<string>('');
  const [filterValue, setFilterValue] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'chart'>('table');
  
  // Generate fake data for demo purposes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Generate mock tables info
        const mockTables: TableInfo[] = [
          { 
            name: 'tasks', 
            count: 87, 
            lastUpdated: '2025-04-10T15:30:00Z',
            fields: ['id', 'title', 'description', 'status', 'priority', 'assigned_to', 'created_at']
          },
          { 
            name: 'contacts', 
            count: 42, 
            lastUpdated: '2025-04-09T12:15:00Z',
            fields: ['id', 'name', 'email', 'phone', 'company', 'role', 'created_at']
          },
          { 
            name: 'discussions', 
            count: 28, 
            lastUpdated: '2025-04-11T09:45:00Z',
            fields: ['id', 'title', 'content', 'user_id', 'upvotes', 'downvotes', 'created_at']
          },
          { 
            name: 'users', 
            count: 15, 
            lastUpdated: '2025-04-08T14:20:00Z',
            fields: ['id', 'name', 'email', 'role', 'last_login', 'created_at']
          },
          { 
            name: 'projects', 
            count: 9, 
            lastUpdated: '2025-04-07T16:50:00Z',
            fields: ['id', 'name', 'description', 'status', 'start_date', 'end_date', 'created_at']
          }
        ];
        
        setTables(mockTables);
        
        // Generate mock data for each table
        const mockData: TableData = {};
        
        // Tasks data
        mockData.tasks = Array(87).fill(0).map((_, i) => ({
          id: `task-${i + 1}`,
          title: `Task ${i + 1}`,
          description: `Description for task ${i + 1}`,
          status: ['todo', 'in-progress', 'done', 'blocked'][Math.floor(Math.random() * 4)],
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          assigned_to: `user-${Math.floor(Math.random() * 15) + 1}`,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        // Contacts data
        mockData.contacts = Array(42).fill(0).map((_, i) => ({
          id: `contact-${i + 1}`,
          name: `Contact ${i + 1}`,
          email: `contact${i + 1}@example.com`,
          phone: `+1-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 10000)}`,
          company: `Company ${Math.floor(Math.random() * 10) + 1}`,
          role: ['Manager', 'Developer', 'Designer', 'CEO', 'CTO'][Math.floor(Math.random() * 5)],
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        // Discussions data
        mockData.discussions = Array(28).fill(0).map((_, i) => ({
          id: `discussion-${i + 1}`,
          title: `Discussion ${i + 1}`,
          content: `Content for discussion ${i + 1}`,
          user_id: `user-${Math.floor(Math.random() * 15) + 1}`,
          upvotes: Math.floor(Math.random() * 50),
          downvotes: Math.floor(Math.random() * 10),
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        // Users data
        mockData.users = Array(15).fill(0).map((_, i) => ({
          id: `user-${i + 1}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: ['admin', 'user', 'manager'][Math.floor(Math.random() * 3)],
          last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        // Projects data
        mockData.projects = Array(9).fill(0).map((_, i) => ({
          id: `project-${i + 1}`,
          name: `Project ${i + 1}`,
          description: `Description for project ${i + 1}`,
          status: ['planning', 'active', 'completed', 'on-hold'][Math.floor(Math.random() * 4)],
          start_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        setTableData(mockData);
        
        if (mockTables.length > 0) {
          setSelectedTable(mockTables[0].name);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error Loading Data",
          description: "There was a problem loading the database data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  const handleRefreshData = () => {
    setIsLoading(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Refreshed",
        description: "The table data has been successfully refreshed."
      });
    }, 1000);
  };
  
  const handleExportData = () => {
    if (!selectedTable) return;
    
    try {
      const dataStr = JSON.stringify(tableData[selectedTable], null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `${selectedTable}_export_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Export Successful",
        description: `Data from ${selectedTable} has been exported.`
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export Failed",
        description: "There was a problem exporting the data.",
        variant: "destructive"
      });
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  const handleFilterChange = (field: string, value: string) => {
    setFilterField(field);
    setFilterValue(value);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const currentTableInfo = tables.find(t => t.name === selectedTable);
  const fields = currentTableInfo?.fields || [];
  
  // Apply filtering, sorting, and pagination
  const filteredData = selectedTable ? tableData[selectedTable]?.filter(item => {
    // Search across all fields
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return Object.values(item).some(val => 
        val && val.toString().toLowerCase().includes(searchLower)
      );
    }
    
    // Apply field-specific filter
    if (filterField && filterValue) {
      const itemValue = item[filterField];
      return itemValue && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
    }
    
    return true;
  }) : [];
  
  // Apply sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? (aValue > bValue ? 1 : -1) 
      : (bValue > aValue ? 1 : -1);
  });
  
  // Apply pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Data Explorer</h1>
          <p className="text-muted-foreground">Browse, filter, and analyze your database tables</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefreshData} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Tables</CardTitle>
              <CardDescription>Select a table to view data</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {tables.map(table => (
                  <Button
                    key={table.name}
                    variant={selectedTable === table.name ? "default" : "ghost"}
                    className="w-full justify-start text-left pl-6 font-normal"
                    onClick={() => {
                      setSelectedTable(table.name);
                      setFilterField('');
                      setFilterValue('');
                      setSortField('');
                      setSortDirection('asc');
                      setCurrentPage(1);
                    }}
                  >
                    <TableIcon className="h-4 w-4 mr-2" />
                    <span>{table.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{table.count}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {currentTableInfo && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Table Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Records:</span>
                    <span className="font-medium">{currentTableInfo.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">{new Date(currentTableInfo.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fields:</span>
                    <span className="font-medium">{currentTableInfo.fields.length}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleExportData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Table
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-3">
          {selectedTable ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl capitalize">{selectedTable}</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant={viewMode === 'table' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setViewMode('table')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === 'grid' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === 'chart' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setViewMode('chart')}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={`Search in ${selectedTable}...`}
                      value={searchQuery}
                      onChange={handleSearch}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={filterField}
                      onValueChange={(value) => handleFilterChange(value, filterValue)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map(field => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {filterField && (
                      <Input
                        placeholder="Filter value..."
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filterField, e.target.value)}
                        className="w-[180px]"
                      />
                    )}
                  </div>
                </div>
                
                {viewMode === 'table' && (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {fields.map(field => (
                              <TableHead 
                                key={field}
                                className="cursor-pointer"
                                onClick={() => handleSort(field)}
                              >
                                <div className="flex items-center">
                                  {field}
                                  {sortField === field && (
                                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                  )}
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={fields.length} className="text-center py-8">
                                <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                                <div className="mt-2 text-muted-foreground">Loading data...</div>
                              </TableCell>
                            </TableRow>
                          ) : paginatedData.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={fields.length} className="text-center h-32">
                                <Database className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                                <div className="text-muted-foreground">No data matches your search criteria</div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedData.map((row, index) => (
                              <TableRow key={index}>
                                {fields.map(field => (
                                  <TableCell key={field}>
                                    {row[field] !== undefined ? String(row[field]).substring(0, 50) : 'N/A'}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {paginatedData.length} of {filteredData.length} results
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronFirst className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages || totalPages === 0}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages || totalPages === 0}
                        >
                          <ChevronLast className="h-4 w-4" />
                        </Button>
                        <Select
                          value={itemsPerPage.toString()}
                          onValueChange={(value) => {
                            setItemsPerPage(Number(value));
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Rows" />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 20, 50, 100].map(value => (
                              <SelectItem key={value} value={value.toString()}>
                                {value} rows
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
                
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading ? (
                      <div className="col-span-full flex items-center justify-center h-64">
                        <RefreshCw className="h-8 w-8 animate-spin" />
                        <div className="ml-4 text-muted-foreground">Loading data...</div>
                      </div>
                    ) : paginatedData.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center h-64">
                        <Database className="h-12 w-12 text-muted-foreground mb-4" />
                        <div className="text-muted-foreground">No data matches your search criteria</div>
                      </div>
                    ) : (
                      paginatedData.map((row, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">
                              {row.name || row.title || row.id || `Item ${index + 1}`}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <div className="space-y-1">
                              {fields.slice(0, 5).map(field => (
                                <div key={field} className="grid grid-cols-3 gap-2">
                                  <span className="text-xs text-muted-foreground col-span-1">{field}:</span>
                                  <span className="text-xs truncate col-span-2">
                                    {row[field] !== undefined ? String(row[field]).substring(0, 50) : 'N/A'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
                
                {viewMode === 'chart' && (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Interactive charts coming soon</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Data visualization will be available in a future update
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-96">
              <Database className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">Select a table</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Choose a table from the list on the left to view and manage your data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Data;
