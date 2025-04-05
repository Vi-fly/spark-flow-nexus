
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Github, Chrome } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const signupSchema = loginSchema;

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

const Auth = () => {
  const { user, loading, signIn, signUp, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('login');

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // If user is already logged in, redirect to home page
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const onLoginSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupValues) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password);
      setActiveTab('login');
      signupForm.reset();
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setIsLoading(true);
    try {
      await signInWithProvider(provider);
    } catch (error) {
      console.error(`${provider} login error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">Task Manager</h1>
          <p className="text-gray-500">Sign in to your account to continue</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your email and password to access your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                {...field} 
                                placeholder="email@example.com" 
                                className="pl-9" 
                                type="email"
                                autoComplete="email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                {...field} 
                                type="password" 
                                className="pl-9" 
                                autoComplete="current-password"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full hover-scale"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          Logging in...
                        </div>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-sm text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSocialLogin('github')}
                    disabled={isLoading}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm" 
                    onClick={() => setActiveTab('signup')}
                  >
                    Sign up
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Enter your email and create a password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                {...field} 
                                placeholder="email@example.com" 
                                className="pl-9" 
                                type="email"
                                autoComplete="email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                {...field} 
                                type="password" 
                                className="pl-9" 
                                autoComplete="new-password"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full hover-scale"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          Creating account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-sm text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSocialLogin('github')}
                    disabled={isLoading}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm" 
                    onClick={() => setActiveTab('login')}
                  >
                    Login
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
