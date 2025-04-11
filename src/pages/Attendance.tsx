
import React, { useState } from 'react';
import { Calendar, Clock, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Attendance = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  
  const handleOpenForm = () => {
    setShowForm(true);
    toast({
      title: "Google Form Opened",
      description: "You can now fill the attendance form"
    });
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Attendance Tracking</h1>
          <p className="text-muted-foreground">
            Monitor team presence, time tracking, and attendance management
          </p>
        </div>
      </div>
      
      {!showForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-all" onClick={handleOpenForm}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Check In
              </CardTitle>
              <CardDescription>
                Record your arrival time and starting work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Use this form to check in at the start of your work day or when beginning a task.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleOpenForm}>Open Form</Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-all" onClick={handleOpenForm}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Check Out
              </CardTitle>
              <CardDescription>
                Record your departure time and task completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Use this form to check out at the end of your work day or when completing a task.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleOpenForm}>Open Form</Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-all" onClick={handleOpenForm}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Time Off Request
              </CardTitle>
              <CardDescription>
                Submit a request for vacation or leave
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Use this form to request time off for vacation, sick leave, or other absences.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleOpenForm}>Open Form</Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-all" onClick={handleOpenForm}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Weekly Timesheet
              </CardTitle>
              <CardDescription>
                Submit your weekly hours and tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Use this form to submit your weekly timesheet with hours worked and tasks completed.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleOpenForm}>Open Form</Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-all" onClick={handleOpenForm}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                Remote Work Request
              </CardTitle>
              <CardDescription>
                Request to work remotely or from home
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Use this form to request approval for remote work or work from home arrangements.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleOpenForm}>Open Form</Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Google Form</h2>
            <Button variant="outline" onClick={handleCloseForm}>Close Form</Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden h-[800px]">
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLSdwAx5H2L7L5o5FtRaZlczIxMsEH4pHkTy95tipTZLqZDEBTw/viewform?embedded=true"
              width="100%" 
              height="100%" 
              frameBorder="0" 
              marginHeight={0} 
              marginWidth={0}
              title="Attendance Form"
            >
              Loading Google Form...
            </iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
