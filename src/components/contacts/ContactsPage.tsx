
import React, { useState, useEffect } from 'react';
import { ContactForm } from './ContactForm';
import { Search, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllContacts, Contact } from '@/services/contactService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ContactsPage component - Displays and manages contacts
 * 
 * Features:
 * - Fetches and displays contacts from Supabase
 * - Allows searching of contacts by name, email or skills
 * - Creates new contacts using the ContactForm
 * - Shows a fallback UI when no contacts are found
 */
export function ContactsPage() {
  // State for contacts and search functionality
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Get toast functionality for notifications
  const { toast } = useToast();
  
  // Get authentication context to check if user is logged in
  const { user } = useAuth();
  
  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.skills && contact.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  /**
   * Fetch contacts when component mounts or when the user changes
   */
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (user) {
          setLoading(true);
          const data = await getAllContacts();
          setContacts(data);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contacts',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [user, toast]);

  /**
   * Handle contact added event from ContactForm
   */
  const handleContactAdded = async () => {
    try {
      // Fetch updated contacts list
      const data = await getAllContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error refreshing contacts:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and form button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <ContactForm onContactAdded={handleContactAdded} />
      </div>
      
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search contacts by name, email, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {/* Contacts grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <Card key={contact.id} className="hover-lift animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-lg">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg">{contact.name}</h3>
                      
                      <div className="mt-2 space-y-1 text-sm">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                        
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
                      
                      {contact.skills && contact.skills.length > 0 && (
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
      )}
    </div>
  );
}
