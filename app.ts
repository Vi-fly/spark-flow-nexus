
// Type definitions
interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  assignedTo?: string;
  estimatedTime?: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  notes?: string;
}

interface User {
  email: string;
  id: string;
}

interface Session {
  user: User | null;
}

// Supabase setup
const SUPABASE_URL = "https://rfumpevizrilmnyloexj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdW1wZXZpenJpbG1ueWxvZXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzgwMTYsImV4cCI6MjA1OTQ1NDAxNn0.PhxVZ3U0P0bio4dJDrQYo3zpuxW0U2u1MZGC4ESPS20";

// Global state
class AppState {
  private static instance: AppState;
  public currentUser: User | null = null;
  public currentSession: Session | null = null;
  public currentPage: string = 'home';
  public theme: 'light' | 'dark' = 'light';
  
  private constructor() {
    // Initialize theme from localStorage
    this.theme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    document.documentElement.classList.toggle('dark', this.theme === 'dark');
    this.updateThemeIcons();
  }
  
  public static getInstance(): AppState {
    if (!AppState.instance) {
      AppState.instance = new AppState();
    }
    return AppState.instance;
  }
  
  public setTheme(theme: 'light' | 'dark'): void {
    this.theme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    this.updateThemeIcons();
  }
  
  private updateThemeIcons(): void {
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    
    if (this.theme === 'dark') {
      sunIcon?.classList.remove('hidden');
      moonIcon?.classList.add('hidden');
    } else {
      sunIcon?.classList.add('hidden');
      moonIcon?.classList.remove('hidden');
    }
  }
  
  public toggleTheme(): void {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }
  
  public setUser(user: User | null): void {
    this.currentUser = user;
    this.updateUserDisplay();
  }
  
  public setSession(session: Session | null): void {
    this.currentSession = session;
    this.setUser(session?.user || null);
  }
  
  public updateUserDisplay(): void {
    const userInitialElement = document.querySelector('.h-8.w-8.rounded-full');
    const userNameElement = document.querySelector('.text-sm.font-medium');
    const userEmailElement = document.querySelector('.text-xs.text-gray-500');
    
    if (this.currentUser) {
      if (userInitialElement) {
        userInitialElement.textContent = this.currentUser.email.charAt(0).toUpperCase();
      }
      
      if (userNameElement) {
        userNameElement.textContent = this.currentUser.email.split('@')[0];
      }
      
      if (userEmailElement) {
        userEmailElement.textContent = this.currentUser.email;
      }
    } else {
      if (userInitialElement) userInitialElement.textContent = 'U';
      if (userNameElement) userNameElement.textContent = 'User';
      if (userEmailElement) userEmailElement.textContent = 'user@example.com';
    }
  }
  
  public navigateTo(page: string): void {
    this.currentPage = page;
    this.loadPage(page);
  }
  
  public loadPage(page: string): void {
    const contentElement = document.getElementById('content');
    if (!contentElement) return;
    
    // Clear current content with fade out animation
    contentElement.classList.remove('animate-fade-in');
    contentElement.classList.add('opacity-0');
    
    setTimeout(() => {
      // Load new content based on page
      switch (page) {
        case 'home':
          contentElement.innerHTML = this.renderHomePage();
          break;
        case 'tasks':
          contentElement.innerHTML = this.renderTasksPage();
          break;
        case 'contacts':
          contentElement.innerHTML = this.renderContactsPage();
          break;
        default:
          contentElement.innerHTML = this.renderPlaceholderPage(page);
      }
      
      // Fade in the new content
      contentElement.classList.remove('opacity-0');
      contentElement.classList.add('animate-fade-in');
      
      // Initialize page specific functionality
      this.initPageFunctionality(page);
    }, 300);
  }
  
  private renderHomePage(): string {
    return `
      <div>
        <h1 class="text-3xl font-bold mb-6">Welcome to Task Manager</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          Use the AI assistant below to manage your tasks and contacts using natural language.
        </p>
        
        <div class="chat-container">
          <div class="chat-messages" id="chatMessages">
            <div class="message message-assistant">
              <p>Hello! I'm your task management assistant. How can I help you today?</p>
            </div>
          </div>
          
          <div class="chat-input">
            <input type="text" id="chatInput" placeholder="Type your message..." 
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700">
            <button id="sendMessageBtn" class="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-all">
              Send
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  private renderTasksPage(): string {
    return `
      <div>
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold">Tasks</h1>
          <button id="addTaskBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-all flex items-center">
            <svg class="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Task
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 class="font-medium mb-4 flex items-center">
              <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              To Do
            </h2>
            <div id="todoTasks">Loading tasks...</div>
          </div>
          
          <div>
            <h2 class="font-medium mb-4 flex items-center">
              <span class="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
              In Progress
            </h2>
            <div id="inProgressTasks">Loading tasks...</div>
          </div>
          
          <div>
            <h2 class="font-medium mb-4 flex items-center">
              <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Done
            </h2>
            <div id="doneTasks">Loading tasks...</div>
          </div>
        </div>
      </div>
    `;
  }
  
  private renderContactsPage(): string {
    return `
      <div>
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold">Contacts</h1>
          <button id="addContactBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-all flex items-center">
            <svg class="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Contact
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="contactsList">
          <div class="animate-pulse text-center p-12">Loading contacts...</div>
        </div>
      </div>
    `;
  }
  
  private renderPlaceholderPage(title: string): string {
    // Format title for display (capitalize)
    const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);
    
    return `
      <div class="text-center py-16">
        <h1 class="text-3xl font-bold mb-6">${formattedTitle}</h1>
        <div class="max-w-lg mx-auto">
          <svg class="w-32 h-32 mx-auto mb-8 text-indigo-500 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            This feature is coming soon. We're working hard to bring you a great ${formattedTitle.toLowerCase()} experience.
          </p>
          <button id="backToHomeBtn" class="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-all">
            Go Back to Home
          </button>
        </div>
      </div>
    `;
  }
  
  private initPageFunctionality(page: string): void {
    // Initialize page specific event listeners and functionality
    switch (page) {
      case 'home':
        this.initChatFunctionality();
        break;
      case 'tasks':
        this.fetchAndRenderTasks();
        this.initTasksPage();
        break;
      case 'contacts':
        this.fetchAndRenderContacts();
        this.initContactsPage();
        break;
      default:
        const backButton = document.getElementById('backToHomeBtn');
        if (backButton) {
          backButton.addEventListener('click', () => this.navigateTo('home'));
        }
    }
  }
  
  private initChatFunctionality(): void {
    const chatInput = document.getElementById('chatInput') as HTMLInputElement;
    const sendButton = document.getElementById('sendMessageBtn');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !sendButton || !chatMessages) return;
    
    const sendMessage = async () => {
      const message = chatInput.value.trim();
      if (!message) return;
      
      // Add user message to chat
      chatMessages.innerHTML += `
        <div class="message message-user">
          <p>${message}</p>
        </div>
      `;
      
      // Clear input
      chatInput.value = '';
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Simulate AI response
      chatMessages.innerHTML += `
        <div class="message message-assistant">
          <div class="flex items-center">
            <div class="spinner mr-2"></div>
            <p>Thinking...</p>
          </div>
        </div>
      `;
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // TODO: Connect to Python backend via API
      // For now, simulate a response after a delay
      setTimeout(() => {
        // Remove thinking message
        const thinkingMessage = chatMessages.querySelector('.message-assistant:last-child');
        if (thinkingMessage) {
          chatMessages.removeChild(thinkingMessage);
        }
        
        // Add AI response
        chatMessages.innerHTML += `
          <div class="message message-assistant animate-fade-in">
            <p>I understand you want to ${message.toLowerCase()}. This feature will be connected to our Python backend soon.</p>
          </div>
        `;
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1500);
    };
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  private async fetchAndRenderTasks(): Promise<void> {
    const todoTasksEl = document.getElementById('todoTasks');
    const inProgressTasksEl = document.getElementById('inProgressTasks');
    const doneTasksEl = document.getElementById('doneTasks');
    
    if (!todoTasksEl || !inProgressTasksEl || !doneTasksEl) return;
    
    try {
      // Simulate fetching tasks from Supabase
      // In a real app, this would be a fetch call to your Python backend or Supabase
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Implement login system',
          description: 'Create login and registration forms with validation',
          deadline: new Date('2025-05-15'),
          priority: 'high',
          status: 'todo',
          estimatedTime: '4 hours'
        },
        {
          id: '2',
          title: 'Design dashboard layout',
          description: 'Create wireframes and mockups for the main dashboard',
          deadline: new Date('2025-05-10'),
          priority: 'medium',
          status: 'in-progress',
          assignedTo: 'Designer'
        },
        {
          id: '3',
          title: 'Fix navigation bug',
          description: 'The sidebar navigation doesn\'t collapse on mobile devices',
          deadline: new Date('2025-05-05'),
          priority: 'low',
          status: 'done',
          estimatedTime: '2 hours'
        }
      ];
      
      // Render tasks by status
      todoTasksEl.innerHTML = this.renderTaskList(mockTasks.filter(task => task.status === 'todo'));
      inProgressTasksEl.innerHTML = this.renderTaskList(mockTasks.filter(task => task.status === 'in-progress'));
      doneTasksEl.innerHTML = this.renderTaskList(mockTasks.filter(task => task.status === 'done'));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      todoTasksEl.innerHTML = '<div class="text-red-500">Error loading tasks</div>';
      inProgressTasksEl.innerHTML = '<div class="text-red-500">Error loading tasks</div>';
      doneTasksEl.innerHTML = '<div class="text-red-500">Error loading tasks</div>';
    }
  }
  
  private renderTaskList(tasks: Task[]): string {
    if (tasks.length === 0) {
      return '<div class="text-gray-500 text-sm">No tasks</div>';
    }
    
    return tasks.map(task => `
      <div class="task-card hover-lift priority-${task.priority}" data-task-id="${task.id}">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-medium">${task.title}</h3>
          <span class="status-badge ${task.status === 'todo' ? 'status-todo' : task.status === 'in-progress' ? 'status-in-progress' : 'status-done'}">
            ${task.status === 'todo' ? 'To Do' : task.status === 'in-progress' ? 'In Progress' : 'Done'}
          </span>
        </div>
        
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">${task.description}</p>
        
        <div class="flex flex-wrap gap-4 text-xs text-gray-500">
          <div class="flex items-center">
            <svg class="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>${task.deadline.toLocaleDateString()}</span>
          </div>
          
          ${task.estimatedTime ? `
            <div class="flex items-center">
              <svg class="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${task.estimatedTime}</span>
            </div>
          ` : ''}
          
          ${task.assignedTo ? `
            <div class="flex items-center">
              <svg class="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>${task.assignedTo}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }
  
  private initTasksPage(): void {
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        this.showToast('Task creation form will be implemented soon');
      });
    }
    
    // Add click event to tasks for editing
    document.querySelectorAll('.task-card').forEach(card => {
      card.addEventListener('click', () => {
        const taskId = card.getAttribute('data-task-id');
        this.showToast(`Task editing for ID ${taskId} will be implemented soon`);
      });
    });
  }
  
  private async fetchAndRenderContacts(): Promise<void> {
    const contactsListEl = document.getElementById('contactsList');
    if (!contactsListEl) return;
    
    try {
      // Simulate fetching contacts from Supabase
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          company: 'Acme Inc',
          role: 'Developer'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '098-765-4321',
          company: 'Tech Co',
          role: 'Designer'
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          company: 'Big Corp',
          role: 'Manager'
        }
      ];
      
      // Render contacts
      contactsListEl.innerHTML = mockContacts.map(contact => `
        <div class="contact-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 animate-fade-in">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium">
                ${contact.name.charAt(0)}
              </div>
              <div class="ml-3">
                <h3 class="font-medium">${contact.name}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">${contact.role || ''}</p>
              </div>
            </div>
            <button class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
          </div>
          
          <div class="space-y-2 text-sm">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>${contact.phone || 'No phone number'}</span>
            </div>
            
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>${contact.email}</span>
            </div>
            
            ${contact.company ? `
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>${contact.company}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error fetching contacts:', error);
      contactsListEl.innerHTML = '<div class="text-red-500">Error loading contacts</div>';
    }
  }
  
  private initContactsPage(): void {
    const addContactBtn = document.getElementById('addContactBtn');
    if (addContactBtn) {
      addContactBtn.addEventListener('click', () => {
        this.showToast('Contact creation form will be implemented soon');
      });
    }
  }
  
  public showToast(message: string, duration: number = 3000): void {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    // Set message
    toastMessage.textContent = message;
    
    // Show toast
    toast.classList.remove('hidden', 'translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    // Hide toast after duration
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-10', 'opacity-0');
      
      // Hide completely after animation
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 300);
    }, duration);
  }
  
  // Authentication methods
  public async login(email: string, password: string): Promise<boolean> {
    try {
      // Simulating Supabase login
      // In a real app, this would call the Python backend or Supabase directly
      console.log('Logging in with:', email, password);
      
      // Simulate successful login
      this.setUser({
        email: email,
        id: '123456'
      });
      
      // Show toast
      this.showToast('Login successful');
      
      // Hide auth modal
      this.hideAuthModal();
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      this.showToast('Login failed. Please try again.');
      return false;
    }
  }
  
  public async signup(email: string, password: string): Promise<boolean> {
    try {
      // Simulating Supabase signup
      console.log('Signing up with:', email, password);
      
      // Simulate successful signup
      this.setUser({
        email: email,
        id: '123456'
      });
      
      // Show toast
      this.showToast('Account created successfully');
      
      // Hide auth modal
      this.hideAuthModal();
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      this.showToast('Signup failed. Please try again.');
      return false;
    }
  }
  
  public async logout(): Promise<void> {
    try {
      // Simulating Supabase logout
      console.log('Logging out');
      
      // Clear user
      this.setUser(null);
      
      // Show toast
      this.showToast('Logged out successfully');
      
      // Show auth modal
      this.showAuthModal();
    } catch (error) {
      console.error('Logout error:', error);
      this.showToast('Logout failed. Please try again.');
    }
  }
  
  public showAuthModal(): void {
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.classList.remove('hidden');
    }
  }
  
  public hideAuthModal(): void {
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.classList.add('hidden');
    }
  }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  const app = AppState.getInstance();
  
  // Setup navigation items
  const navItems = [
    { title: 'Home', icon: 'home', path: 'home' },
    { title: 'Tasks', icon: 'check-square', path: 'tasks' },
    { title: 'Contacts', icon: 'users', path: 'contacts' },
    { title: 'Gantt Chart', icon: 'bar-chart-2', path: 'gantt' },
    { title: 'Email', icon: 'mail', path: 'email' },
    { title: 'Resource Bot', icon: 'bot', path: 'resources' },
    { title: 'Data View', icon: 'database', path: 'data' },
    { title: 'Discussions', icon: 'message-square', path: 'discussions' },
    { title: 'Attendance', icon: 'clock', path: 'attendance' },
    { title: 'Settings', icon: 'settings', path: 'settings' },
  ];
  
  const navItemsContainer = document.getElementById('navItems');
  if (navItemsContainer) {
    navItemsContainer.innerHTML = navItems.map(item => `
      <li>
        <a href="#${item.path}" class="nav-item flex items-center p-2 rounded-md transition-all duration-200 group text-sidebar-foreground hover:bg-sidebar-accent/50" data-path="${item.path}">
          <svg class="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${getIconPath(item.icon)}
          </svg>
          <span>${item.title}</span>
        </a>
      </li>
    `).join('');
    
    // Add click event to navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const path = item.getAttribute('data-path');
        if (path) {
          app.navigateTo(path);
          
          // Update active state
          document.querySelectorAll('.nav-item').forEach(navItem => {
            navItem.classList.remove('bg-sidebar-accent', 'font-medium', 'text-primary');
          });
          item.classList.add('bg-sidebar-accent', 'font-medium', 'text-primary');
        }
      });
    });
  }
  
  // Set up theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      app.toggleTheme();
    });
  }
  
  // Set up logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      app.logout();
    });
  }
  
  // Set up auth form
  const authForm = document.getElementById('authForm');
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      
      if (emailInput && passwordInput) {
        app.login(emailInput.value, passwordInput.value);
      }
    });
  }
  
  // Set up sign up button
  const signUpBtn = document.getElementById('signUpBtn');
  if (signUpBtn) {
    signUpBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      
      if (emailInput && passwordInput) {
        app.signup(emailInput.value, passwordInput.value);
      }
    });
  }
  
  // Show auth modal on load if not logged in
  if (!app.currentUser) {
    app.showAuthModal();
  }
  
  // Load home page by default
  app.navigateTo('home');
  
  // Helper function to get icon SVG path based on icon name
  function getIconPath(icon: string): string {
    switch (icon) {
      case 'home':
        return '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>';
      case 'users':
        return '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>';
      case 'check-square':
        return '<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>';
      case 'bar-chart-2':
        return '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>';
      case 'mail':
        return '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>';
      case 'bot':
        return '<rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line>';
      case 'database':
        return '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>';
      case 'message-square':
        return '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>';
      case 'clock':
        return '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>';
      case 'settings':
        return '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>';
      default:
        return '';
    }
  }
});
