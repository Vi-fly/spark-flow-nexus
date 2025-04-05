
import React, { useState } from 'react';
import { ContactForm } from './ContactForm';
import { Search, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  skills: string[];
  avatar?: string;
};

// Sample data
const sampleContacts: Contact[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Seattle, WA',
    skills: ['Project Management', 'Leadership', 'Strategic Planning'],
    avatar: 'A',
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '(555) 987-6543',
    address: '456 Oak Ave, Portland, OR',
    skills: ['Content Writing', 'SEO', 'Social Media'],
    avatar: 'S',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '(555) 456-7890',
    address: '789 Pine Rd, San Francisco, CA',
    skills: ['Frontend Development', 'React', 'UI/UX Design'],
    avatar: 'M',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '(555) 234-5678',
    address: '101 Cedar Ln, New York, NY',
    skills: ['Graphic Design', 'Branding', 'Animation'],
    avatar: 'E',
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'robert.wilson@example.com',
    phone: '(555) 876-5432',
    address: '202 Elm St, Chicago, IL',
    skills: ['Data Analysis', 'Statistics', 'Reporting'],
    avatar: 'R',
  },
];

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(sampleContacts);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleContactAdded = () => {
    // In a real app, we would fetch the latest contacts
    console.log('Contact added, would refresh the list');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <ContactForm onContactAdded={handleContactAdded} />
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search contacts by name, email, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <Card key={contact.id} className="hover-lift animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-lg">
                    {contact.avatar}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg">{contact.name}</h3>
                    
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                      
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      
                      {contact.address && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{contact.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {contact.skills.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-1 mb-1.5 text-xs text-muted-foreground">
                          <Briefcase className="h-3 w-3" />
                          <span>Skills:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {contact.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs font-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg border border-dashed">
            <User className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground text-center">No contacts found matching your search criteria.</p>
            {searchTerm && (
              <Button 
                variant="link" 
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
