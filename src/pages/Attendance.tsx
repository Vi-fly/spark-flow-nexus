import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Clock } from 'lucide-react';

const Attendance = () => {
  const { toast } = useToast();
  const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc8kHkCHt-8Zxs3TJGknYFyfrW9B-zEd9yJTlTMLtATg8ZZhA/viewform";

  const handleOpenForm = () => {
    window.open(FORM_URL, '_blank');
    toast({
      title: "Form Opened",
      description: "Attendance form has been opened in a new tab"
    });
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Check In/Out
            </CardTitle>
            <CardDescription>
              Record your daily attendance and working hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use this form to record your daily attendance and working hours.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleOpenForm}>Open Form</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;