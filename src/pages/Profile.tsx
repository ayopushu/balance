/**
 * Profile Screen - Simplified with username and analytics CTA
 * Shows themed design with username management and analytics access
 */

import React, { useState } from 'react';
import { User, BarChart3, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBalanceStore } from '@/store';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, pillars } = useBalanceStore();
  const { toast } = useToast();

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(settings.userName);

  // Handle name update
  const handleNameUpdate = () => {
    updateSettings({ userName: newName });
    setEditingName(false);
    toast({
      title: "Name updated",
      description: "Your name has been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-balance-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-balance-background/95 backdrop-blur-sm border-b border-balance-surface-elevated">
        <div className="container mx-auto px-4 py-4">
          <h1 className="heading-lg text-balance-text-primary">Profile</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="surface p-8">
              <div className="flex flex-col items-center space-y-6">
                {/* Themed Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-health via-relationships to-work rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-balance-surface border-2 border-balance-background rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-health rounded-full animate-pulse" />
                  </div>
                </div>
                
                {/* Name Section */}
                <div className="text-center">
                  {editingName ? (
                    <div className="flex flex-col items-center space-y-3 w-full max-w-xs mx-auto">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance text-center w-full"
                        autoFocus
                        placeholder="Enter your name"
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleNameUpdate} size="sm" className="bg-health hover:bg-health/90 text-white rounded-balance">
                          Save
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingName(false);
                            setNewName(settings.userName);
                          }}
                          className="rounded-balance"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="heading-lg text-balance-text-primary mb-3 truncate max-w-xs mx-auto">
                        {settings.userName}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingName(true)}
                        className="text-balance-text-muted hover:text-balance-text-primary rounded-balance px-6"
                      >
                        Edit name
                      </Button>
                    </div>
                  )}
                </div>

                {/* Decorative dots only */}
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-3 h-3 bg-health rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-relationships rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <div className="w-3 h-3 bg-work rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Analytics CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="space-y-4"
          >
            <Button 
              onClick={() => navigate('/analytics')}
              className="w-full bg-gradient-to-r from-health via-relationships to-work text-white rounded-balance h-20 text-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <BarChart3 className="w-8 h-8 mr-3" />
              <div className="flex flex-col">
                <span>Check My Balance</span>
                <span className="text-sm opacity-90">View your analytics & progress</span>
              </div>
            </Button>

            {/* Animated background elements */}
            <div className="relative overflow-hidden rounded-balance bg-gradient-to-r from-health/10 via-relationships/10 to-work/10 p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-health/5 via-relationships/5 to-work/5 animate-pulse" />
              <div className="relative">
                <h3 className="heading-sm text-balance-text-primary mb-2">Your Balance Journey</h3>
                <p className="body-md text-balance-text-secondary">
                  Track your progress across all life pillars and discover insights about your daily balance.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            {[
              { color: 'health', icon: '🌱', label: 'Wellness' },
              { color: 'relationships', icon: '💝', label: 'Connection' },
              { color: 'work', icon: '⚡', label: 'Achievement' },
            ].map((item, index) => (
              <Card key={item.color} className="surface p-4 text-center hover-scale">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, type: 'spring', stiffness: 200 }}
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="body-sm text-balance-text-muted">{item.label}</div>
                </motion.div>
              </Card>
            ))}
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};