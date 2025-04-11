
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { databaseConnector } from '@/utils/databaseConnector';
import {
  Database,
  Table as TableIcon,
  Search,
  RefreshCw,
  Download,
  Filter,
  FileSpreadsheet,
  Eye,
  HelpCircle
} from 'lucide-react';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';

const Data = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    checkConnection();
  }, []);
  
  const checkConnection = async () => {
    try {
      setIsLoading(true);
      // Check if connected to MongoDB
      if (databaseConnector.getCurrentConnection() !== 'mongodb') {
        databaseConnector.configureMongoDb('mongodb://localhost:27017', 'database');
      }
      
      const connected = await databaseConnector.testConnection();
      setIsConnected(connected);
      
      if (connected) {
        // Would fetch collections from MongoDB in a real application
        fetchDemoCollections();
        toast({
          title: "Database Connected",
          description: "Successfully connected to the database.",
        });
      } else {
        // Load demo data
        fetchDemoCollections();
        toast({
          title: "Using Demo Data",
          description: "Could not connect to a real database. Using demo data.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error connecting to database:', error);
      fetchDemoCollections();
      toast({
        title: "Connection Error",
        description: "Failed to connect to the database. Using demo data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchDemoCollections = () => {
    // Demo collections
    const demoCollections = ['tasks', 'users', 'projects', 'contacts', 'discussions', 'comments'];
    setCollections(demoCollections);
    
    if (demoCollections.length > 0) {
      // Select first collection by default
      setActiveTable(demoCollections[0]);
      fetchTableData(demoCollections[0]);
    }
  };
  
  const fetchTableData = (collectionName: string) => {
    setIsLoading(true);
    setActiveTable(collectionName);
    
    // Generate demo data based on the collection
    let data: any[] = [];
    let columns: string[] = [];
    
    switch (collectionName) {
      case 'tasks':
        columns = ['id', 'title', 'status', 'priority', 'assigned_to', 'deadline'];
        data = Array.from({ length: 25 }, (_, i) => ({
          id: `task-${i+1}`,
          title: `Task ${i+1}`,
          status: ['todo', 'in-progress', 'done'][Math.floor(Math.random() * 3)],
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          assigned_to: ['John', 'Sarah', 'Mike', 'Lisa'][Math.floor(Math.random() * 4)],
          deadline: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }));
        break;
        
      case 'users':
        columns = ['id', 'name', 'email', 'role', 'created_at'];
        data = Array.from({ length: 15 }, (_, i) => ({
          id: `user-${i+1}`,
          name: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Lisa Brown', 'Alex Wong'][i % 5],
          email: `user${i+1}@example.com`,
          role: ['admin', 'editor', 'viewer'][Math.floor(Math.random() * 3)],
          created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }));
        break;
        
      case 'projects':
        columns = ['id', 'name', 'status', 'start_date', 'end_date', 'owner'];
        data = Array.from({ length: 10 }, (_, i) => ({
          id: `proj-${i+1}`,
          name: `Project ${i+1}`,
          status: ['planning', 'in-progress', 'completed', 'on-hold'][Math.floor(Math.random() * 4)],
          start_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          owner: ['John', 'Sarah', 'Mike', 'Lisa'][Math.floor(Math.random() * 4)]
        }));
        break;
        
      case 'contacts':
        columns = ['id', 'name', 'email', 'phone', 'company', 'role'];
        data = Array.from({ length: 20 }, (_, i) => ({
          id: `contact-${i+1}`,
          name: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Lisa Brown', 'Alex Wong'][i % 5],
          email: `contact${i+1}@example.com`,
          phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          company: ['Acme Inc', 'Globex Corp', 'Initech', 'Umbrella Corp', 'Stark Industries'][i % 5],
          role: ['CEO', 'Manager', 'Developer', 'Designer', 'Marketing'][i % 5]
        }));
        break;
        
      case 'discussions':
        columns = ['id', 'title', 'author', 'created_at', 'upvotes', 'comments'];
        data = Array.from({ length: 15 }, (_, i) => ({
          id: `disc-${i+1}`,
          title: `Discussion topic ${i+1}`,
          author: ['John', 'Sarah', 'Mike', 'Lisa'][Math.floor(Math.random() * 4)],
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          upvotes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20)
        }));
        break;
        
      case 'comments':
        columns = ['id', 'discussion_id', 'author', 'content', 'created_at', 'upvotes'];
        data = Array.from({ length: 30 }, (_, i) => ({
          id: `comment-${i+1}`,
          discussion_id: `disc-${Math.floor(Math.random() * 15) + 1}`,
          author: ['John', 'Sarah', 'Mike', 'Lisa'][Math.floor(Math.random() * 4)],
          content: `This is comment ${i+1}. It contains some text about the discussion.`,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          upvotes: Math.floor(Math.random() * 10)
        }));
        break;
        
      default:
        columns = ['id', 'name', 'value'];
        data = Array.from({ length: 5 }, (_, i) => ({
          id: `item-${i+1}`,
          name: `Demo Item ${i+1}`,
          value: `Value ${i+1}`
        }));
    }
    
    setTableColumns(columns);
    setTableData(data);
    setIsLoading(false);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'in-progress':
        return "bg-blue-100 text-blue-800";
      case 'todo':
      case 'planning':
        return "bg-yellow-100 text-yellow-800";
      case 'on-hold':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleExportCSV = () => {
    const headers = tableColumns.join(',');
    const rows = tableData.map(row => 
      tableColumns.map(col => 
        typeof row[col] === 'string' && row[col].includes(',') 
          ? `"${row[col]}"` 
          : row[col]
      ).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTable}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${activeTable} as CSV file.`,
    });
  };
  
  // Filter the table data
  const filteredData = tableData.filter(row => {
    if (!filterValue) return true;
    
    return tableColumns.some(column => {
      const value = row[column];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(filterValue.toLowerCase());
    });
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Data Explorer</h1>
          <p className="text-muted-foreground">
            Browse and analyze your application data
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
              <span className="text-sm text-muted-foreground">Connected to Database</span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
              <span className="text-sm text-muted-foreground">Using Demo Data</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={checkConnection}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar with collections */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Collections
            </CardTitle>
            <CardDescription>
              Select a table to view its data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {collections.map(collection => (
                <Button
                  key={collection}
                  variant={activeTable === collection ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => fetchTableData(collection)}
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  {collection}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Main content with table data */}
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                {activeTable}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-8 w-[200px]"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                </div>
                
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="outline" size="icon">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Data Explorer Help</h4>
                      <p className="text-sm">
                        Browse tables and their data. Use the search box to filter results and export to CSV.
                      </p>
                      <ul className="text-sm list-disc pl-4 space-y-1">
                        <li>Click on a collection name to view its data</li>
                        <li>Use the search box to filter across all columns</li>
                        <li>Export the visible data to CSV using the export button</li>
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : tableData.length === 0 ? (
              <div className="text-center py-8">
                <TableIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No data available</h3>
                <p className="text-sm text-muted-foreground">
                  Select a collection or check your database connection
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableColumns.map(column => (
                        <TableHead key={column} className="whitespace-nowrap">
                          {column.replace('_', ' ')}
                        </TableHead>
                      ))}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {tableColumns.map(column => (
                          <TableCell key={column} className="whitespace-nowrap">
                            {column === 'status' ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row[column])}`}>
                                {row[column]}
                              </span>
                            ) : (
                              String(row[column])
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Showing {Math.min(startIndex + 1, filteredData.length)} to {Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length} entries
                    </span>
                    
                    <Select
                      value={rowsPerPage.toString()}
                      onValueChange={(value) => {
                        setRowsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="10 per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 per page</SelectItem>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNumber = i + 1;
                        // Show pages around current page
                        let pageToShow = pageNumber;
                        if (totalPages > 5 && currentPage > 3) {
                          pageToShow = currentPage - 3 + i;
                          if (pageToShow > totalPages) {
                            pageToShow = totalPages - (4 - i);
                          }
                        }
                        
                        return (
                          <Button
                            key={pageToShow}
                            variant={currentPage === pageToShow ? "default" : "outline"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(pageToShow)}
                          >
                            {pageToShow}
                          </Button>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && <span className="mx-1">...</span>}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Data;
