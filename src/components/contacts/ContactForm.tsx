
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PlusCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createContact, ContactInput } from '@/services/contactService';

/**
 * Props for ContactForm component
 */
type ContactFormProps = {
  onContactAdded: () => void;
};

/**
 * ContactForm component - Form for creating new contacts
 * 
 * Features:
 * - Collects and validates contact information
 * - Allows adding multiple skills with tags 
 * - Submits data to Supabase through contactService
 * - Provides feedback on submission success/errors
 */
export function ContactForm({ onContactAdded }: ContactFormProps) {
  // Form fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [notes, setNotes] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  
  // Dialog state
  const [open, setOpen] = useState(false);
  
  // Form validation state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  // Loading state for submit button
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate the form fields
   */
  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
    };
    
    let isValid = true;
    
    // Name is required
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    // Email validation if provided
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Phone validation if provided
    if (phone.trim() && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare contact data
      const contactData: ContactInput = {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        company: company || null,
        role: role || null,
        notes: notes || null,
        skills: skills,
      };
      
      // Create contact in Supabase
      const createdContact = await createContact(contactData);
      
      if (createdContact) {
        // Reset form and close dialog
        resetForm();
        setOpen(false);
        
        // Notify parent component
        onContactAdded();
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      toast.error('Failed to create contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset all form fields
   */
  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCompany('');
    setRole('');
    setNotes('');
    setSkills([]);
    setCurrentSkill('');
    setErrors({
      name: '',
      email: '',
      phone: '',
    });
  };

  /**
   * Add a skill to the skills array
   */
  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  /**
   * Remove a skill from the skills array
   */
  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hover-scale flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Fill in the contact details below to add a new contact to your database
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone field */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(123) 456-7890"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Company and Role fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">
                Company <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
          </div>

          {/* Address field */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, Country"
              rows={2}
            />
          </div>

          {/* Skills field */}
          <div className="space-y-2">
            <Label htmlFor="skills">
              Skills <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="skills"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" onClick={addSkill} size="sm" variant="outline">
                Add
              </Button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeSkill(skill)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes field */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the contact..."
              rows={3}
            />
          </div>

          {/* Form actions */}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="hover-scale"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
