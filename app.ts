
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  assignee?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
}

// Theme management class with animations
class ThemeManager {
  private theme: 'light' | 'dark';
  private htmlRoot: HTMLElement;
  private themeBtnIcon: {
    sun: HTMLElement | null;
    moon: HTMLElement | null;
  };

  constructor() {
    this.htmlRoot = document.documentElement;
    this.themeBtnIcon = {
      sun: document.getElementById('sunIcon'),
      moon: document.getElementById('moonIcon')
    };
    this.theme = this.getInitialTheme();
    this.applyTheme();
    this.setupListeners();
  }

  private getInitialTheme(): 'light' | 'dark' {
    // Check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(): void {
    // Toggle dark class on html element
    this.htmlRoot.classList.toggle('dark', this.theme === 'dark');
    
    // Toggle icon visibility with animation
    if (this.themeBtnIcon.sun && this.themeBtnIcon.moon) {
      if (this.theme === 'dark') {
        this.themeBtnIcon.moon.classList.add('hidden');
        this.themeBtnIcon.sun.classList.remove('hidden');
        this.themeBtnIcon.sun.classList.add('animate-bounce-in');
      } else {
        this.themeBtnIcon.sun.classList.add('hidden');
        this.themeBtnIcon.moon.classList.remove('hidden');
        this.themeBtnIcon.moon.classList.add('animate-bounce-in');
      }
    }
    
    // Apply transition classes to elements
    document.querySelectorAll('.task-card, .chat-container, .btn, .form-input')
      .forEach(el => {
        el.classList.add('transition-all', 'duration-300');
      });
  }

  private setupListeners(): void {
    // Toggle theme on button click
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        this.theme = e.matches ? 'dark' : 'light';
        this.applyTheme();
      }
    });
  }

  public toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
    
    // Add micro-animations to elements when theme changes
    document.querySelectorAll('.task-card').forEach((el, index) => {
      el.classList.add('animate-bounce-in');
      (el as HTMLElement).style.animationDelay = `${index * 0.1}s`;
      setTimeout(() => {
        el.classList.remove('animate-bounce-in');
      }, 1000);
    });
  }
}

// Authentication manager with animations
class AuthManager {
  private currentUser: User | null = null;
  private authForm: HTMLFormElement | null;
  private authModal: HTMLElement | null;
  private tabButtons: NodeListOf<Element>;
  private rememberMe: HTMLElement | null;
  private isLogin: boolean = true;
  
  constructor() {
    this.authForm = document.getElementById('authForm') as HTMLFormElement;
    this.authModal = document.getElementById('authModal');
    this.tabButtons = document.querySelectorAll('.auth-tab-btn');
    this.rememberMe = document.getElementById('rememberMe');
    
    this.setupListeners();
    this.checkSession();
  }
  
  private setupListeners(): void {
    // Auth form submission
    if (this.authForm) {
      this.authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAuth();
      });
    }
    
    // Tab switching
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.isLogin = button.textContent === 'Login';
        this.updateAuthUI();
      });
    });
    
    // Remember me toggle
    if (this.rememberMe) {
      this.rememberMe.addEventListener('click', () => {
        this.rememberMe?.classList.toggle('checked');
      });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  }
  
  private checkSession(): void {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.hideAuthModal();
        this.showToast('Welcome back, ' + (this.currentUser.name || this.currentUser.email));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        this.logout();
      }
    } else {
      this.showAuthModal();
    }
  }
  
  private updateAuthUI(): void {
    const title = document.querySelector('#authModal h2');
    const submitBtn = document.querySelector('#authModal button[type="submit"]');
    const toggleLink = document.querySelector('#authModal p a');
    
    if (title && submitBtn && toggleLink) {
      if (this.isLogin) {
        title.textContent = 'Login to Task Manager';
        submitBtn.textContent = 'Sign In';
        toggleLink.textContent = 'Sign up';
      } else {
        title.textContent = 'Create Your Account';
        submitBtn.textContent = 'Sign Up';
        toggleLink.textContent = 'Sign in';
      }
    }
    
    // Update active tab styling
    this.tabButtons.forEach(btn => {
      if ((btn.textContent === 'Login' && this.isLogin) || (btn.textContent === 'Sign Up' && !this.isLogin)) {
        btn.classList.remove('text-gray-500', 'dark:text-gray-400');
        btn.classList.add('text-indigo-600', 'dark:text-indigo-400', 'border-b-2', 'border-indigo-600', 'dark:border-indigo-400', 'font-medium');
      } else {
        btn.classList.remove('text-indigo-600', 'dark:text-indigo-400', 'border-b-2', 'border-indigo-600', 'dark:border-indigo-400', 'font-medium');
        btn.classList.add('text-gray-500', 'dark:text-gray-400');
      }
    });
  }
  
  private async handleAuth(): Promise<void> {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    
    if (!emailInput || !passwordInput) return;
    
    const email = emailInput.value;
    const password = passwordInput.value;
    
    // Simulate loading with animation
    const submitBtn = document.querySelector('#authModal button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) {
      const originalText = submitBtn.textContent || '';
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="flex items-center justify-center">
          <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ${this.isLogin ? 'Signing in...' : 'Creating account...'}
        </div>
      `;
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demo purposes, we'll just create a mock user
        this.currentUser = {
          id: 'user_' + new Date().getTime(),
          email: email,
          name: email.split('@')[0]
        };
        
        // Store in localStorage if "remember me" is checked
        if (this.rememberMe?.classList.contains('checked')) {
          localStorage.setItem('user', JSON.stringify(this.currentUser));
        }
        
        this.hideAuthModal();
        this.showToast(this.isLogin ? 'Successfully logged in!' : 'Account created successfully!');
        
      } catch (error) {
        console.error('Auth error:', error);
        this.showToast('Authentication failed. Please try again.', 'error');
      } finally {
        // Restore button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }
  
  private logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
    this.showAuthModal();
    this.showToast('Successfully logged out');
  }
  
  private showAuthModal(): void {
    if (this.authModal) {
      this.authModal.classList.remove('hidden');
      this.authModal.querySelector('.bg-white')?.classList.add('animate-scale-in');
    }
  }
  
  private hideAuthModal(): void {
    if (this.authModal) {
      this.authModal.classList.add('hidden');
    }
  }
  
  public showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
      // Set message and style based on type
      toastMessage.textContent = message;
      
      if (type === 'error') {
        toast.classList.add('border-red-500');
        toast.querySelector('svg')?.classList.add('text-red-500');
      } else {
        toast.classList.remove('border-red-500');
        toast.querySelector('svg')?.classList.remove('text-red-500');
      }
      
      // Show toast with animation
      toast.classList.remove('hidden');
      toast.classList.add('animate-bounce-in');
      
      // Hide after delay
      setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('animate-bounce-in');
      }, 3000);
    }
  }
}

// Task manager for handling task operations
class TaskManager {
  private tasks: Task[] = [];
  
  constructor() {
    this.loadMockTasks();
  }
  
  private loadMockTasks(): void {
    // Add some mock tasks for demonstration
    this.tasks = [
      {
        id: 'task_1',
        title: 'Complete Project Proposal',
        description: 'Finish the project proposal by end of week including budget estimates and timeline.',
        status: 'in-progress',
        priority: 'high',
        deadline: '2025-04-15T12:00:00Z',
        assignee: 'JD'
      },
      {
        id: 'task_2',
        title: 'Review Client Feedback',
        description: 'Go through client feedback and prepare response with action items.',
        status: 'todo',
        priority: 'medium',
        deadline: '2025-04-12T12:00:00Z',
        assignee: 'LM'
      },
      {
        id: 'task_3',
        title: 'Schedule Team Meeting',
        description: 'Schedule weekly team meeting and prepare agenda for discussion.',
        status: 'done',
        priority: 'low',
        deadline: '2025-04-10T12:00:00Z',
        assignee: 'TS'
      }
    ];
  }
  
  // Additional task CRUD methods would go here
}

// Chat assistant manager
class ChatAssistant {
  private messages: Message[] = [];
  private messagesContainer: HTMLElement | null;
  private chatInput: HTMLInputElement | null;
  private sendButton: HTMLElement | null;
  
  constructor() {
    this.messagesContainer = document.querySelector('.chat-messages');
    this.chatInput = document.querySelector('.chat-input input') as HTMLInputElement;
    this.sendButton = document.querySelector('.chat-input button');
    
    this.initMessages();
    this.setupListeners();
  }
  
  private initMessages(): void {
    // Add initial messages
    this.messages = [
      {
        id: 'msg_1',
        text: 'Hello! How can I help you manage your tasks today?',
        sender: 'assistant',
        timestamp: Date.now() - 10000
      },
      {
        id: 'msg_2',
        text: 'I need to create a new task for the marketing campaign',
        sender: 'user',
        timestamp: Date.now() - 5000
      },
      {
        id: 'msg_3',
        text: 'Sure! Please provide the details for the marketing campaign task, such as title, description, deadline, and priority.',
        sender: 'assistant',
        timestamp: Date.now()
      }
    ];
  }
  
  private setupListeners(): void {
    // Send message on button click
    if (this.sendButton && this.chatInput) {
      this.sendButton.addEventListener('click', () => this.sendMessage());
    }
    
    // Send message on Enter key
    if (this.chatInput) {
      this.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }
  }
  
  private sendMessage(): void {
    if (!this.chatInput || !this.chatInput.value.trim()) return;
    
    const userMessage = this.chatInput.value.trim();
    
    // Create and add user message
    const newUserMessage: Message = {
      id: 'msg_' + Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: Date.now()
    };
    
    this.messages.push(newUserMessage);
    this.renderMessage(newUserMessage);
    
    // Clear input
    this.chatInput.value = '';
    
    // Simulate assistant response after a delay
    setTimeout(() => {
      // Process the message and get a response
      const responseText = this.getResponseFor(userMessage);
      
      // Create and add assistant message
      const assistantMessage: Message = {
        id: 'msg_' + Date.now(),
        text: responseText,
        sender: 'assistant',
        timestamp: Date.now()
      };
      
      this.messages.push(assistantMessage);
      this.renderMessage(assistantMessage);
      
      // Scroll to bottom
      if (this.messagesContainer) {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }
    }, 1000);
  }
  
  private renderMessage(message: Message): void {
    if (!this.messagesContainer) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${message.sender}`;
    messageEl.innerHTML = `<p>${message.text}</p>`;
    
    this.messagesContainer.appendChild(messageEl);
    
    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  private getResponseFor(message: string): string {
    // Simple rule-based responses
    message = message.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) {
      return 'Hello! How can I assist you with your tasks today?';
    }
    
    if (message.includes('create') || message.includes('add') || message.includes('new task')) {
      return 'To create a new task, please provide the following details: title, description, deadline, and priority level.';
    }
    
    if (message.includes('deadline') || message.includes('due date')) {
      return 'You can set a deadline when creating or editing a task. Would you like me to show you how?';
    }
    
    if (message.includes('priority')) {
      return 'Tasks can have three priority levels: low, medium, and high. This helps you focus on what matters most.';
    }
    
    if (message.includes('thank')) {
      return 'You\'re welcome! Is there anything else you need help with?';
    }
    
    // Default response
    return 'I\'m here to help you manage your tasks more efficiently. What would you like to do?';
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const themeManager = new ThemeManager();
  const authManager = new AuthManager();
  const taskManager = new TaskManager();
  const chatAssistant = new ChatAssistant();
  
  // For demo: Show a welcome toast
  setTimeout(() => {
    authManager.showToast('Welcome to the enhanced Task Manager!');
  }, 1000);
});
