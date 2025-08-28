// app/(public)/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CheckCircle, Users, Zap, Globe } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
      
    if (token) {
      // User is already logged in, redirect to home
      router.push('/home');
    }
  }, [router]);

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">KanbanFlow</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={handleSignIn}
              className="text-gray-700 hover:text-gray-900"
            >
              Sign In
            </Button>
            <Button 
              onClick={handleSignUp}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <div className="text-center py-16 lg:py-24">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Organize Your Work
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Boost Your Productivity
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The visual project management tool that helps teams move work forward. 
            Simple, flexible, and powerful.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Button 
              size="lg"
              onClick={handleSignUp}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Start Your Free Board
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={handleSignIn}
              className="px-8 py-3 text-lg border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Sign In
            </Button>
          </div>

          {/* Demo Board Preview */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-2xl bg-white/70 backdrop-blur-sm border-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* To Do Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">To Do</h3>
                    <span className="text-xs text-gray-500">3 tasks</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-medium text-sm">Setup project structure</h4>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">High Priority</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-medium text-sm">Design wireframes</h4>
                      <div className="flex items-center mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Design</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doing Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">Doing</h3>
                    <span className="text-xs text-gray-500">1 task</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium text-sm">Implement authentication</h4>
                    <div className="flex items-center mt-2">
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">In Progress</span>
                    </div>
                  </div>
                </div>

                {/* Done Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">Done</h3>
                    <span className="text-xs text-gray-500">2 tasks</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-medium text-sm">Initial setup</h4>
                      <div className="flex items-center mt-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Simple & Intuitive</h3>
              <p className="text-gray-600">Easy to use drag-and-drop interface that anyone can master in minutes.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-600">Work together seamlessly with real-time updates and team workspaces.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Powerful Features</h3>
              <p className="text-gray-600">Advanced features like due dates, labels, and customizable workflows.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8">Join thousands of teams already using KanbanFlow</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg"
              onClick={handleSignUp}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              Create Free Account
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={handleSignIn}
              className="px-8 py-3 text-lg"
            >
              Sign In to Your Account
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 KanbanFlow. Built for productivity enthusiasts.</p>
        </div>
      </footer>
    </div>
  );
}