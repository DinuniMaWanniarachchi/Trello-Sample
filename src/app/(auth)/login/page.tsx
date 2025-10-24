/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(auth)/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const returnUrl = searchParams.get('returnUrl') || '/home';
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  // Note: Do not auto-redirect from the login page even if authenticated.

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Please input your Email!';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address!';
    }
    
    if (!formData.password) {
      newErrors.password = 'Please input your Password!';
    }
    
    if (!formData.remember) {
       
      (newErrors as any).remember = 'Please mark Remember me to continue';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('🔑 Attempting login for:', formData.email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Login API successful');
        
        // CRITICAL: Use AuthContext login method
        login(data.token, data.user, formData.remember);
        
        console.log('✅ Auth context updated, navigating...');
        
        // Small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Always navigate to home when Remember me is required/checked
        console.log('Navigating to: /home');
        router.push('/home');
        
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Sign In</h1>
            <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
            {returnUrl !== '/home' && (
              <p className="text-xs text-blue-600 mt-1">
                Redirecting to: {returnUrl}
              </p>
            )}
          </div>

          {loginError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{loginError}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.remember}
                onChange={(e) => handleInputChange('remember', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <div className="text-center">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                Forgot password?
              </a>
            </div>
          </div>
          { (errors as any).remember && (
             
            <p className="text-sm text-red-500">{(errors as any).remember}</p>
          )}

          <Button 
            type="submit" 
            className="w-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 disabled:bg-blue-600/70"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
            <a 
              href="/register" 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Register now!
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
}