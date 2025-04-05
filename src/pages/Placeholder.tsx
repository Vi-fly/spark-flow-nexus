
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
  comingSoon?: boolean;
}

const Placeholder: React.FC<PlaceholderProps> = ({ 
  title, 
  description, 
  comingSoon = true 
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
        <LayoutDashboard className="h-8 w-8 text-indigo-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {comingSoon && (
        <div className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full font-medium">
          Coming Soon
        </div>
      )}
      <Button 
        variant="outline" 
        className="mt-8 hover-lift"
        onClick={() => navigate('/')}
      >
        Return to Dashboard
      </Button>
    </div>
  );
};

export default Placeholder;
