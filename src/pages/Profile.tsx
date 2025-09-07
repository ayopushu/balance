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
  const {
    settings,
    updateSettings,
    pillars
  } = useBalanceStore();
  const {
    toast
  } = useToast();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(settings.userName);

  // Handle name update
  const handleNameUpdate = () => {
    updateSettings({
      userName: newName
    });
    setEditingName(false);
    toast({
      title: "Name updated",
      description: "Your name has been saved successfully."
    });
  };
  return <div className="min-h-screen bg-balance-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-balance-background/95 backdrop-blur-sm border-b border-balance-surface-elevated">
        <div className="container mx-auto px-4 py-4">
          <h1 className="heading-lg text-balance-text-primary">Profile</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* User Info Card */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
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
                  {editingName ? <div className="flex flex-col items-center space-y-3 w-full max-w-xs mx-auto">
                      <Input value={newName} onChange={e => setNewName(e.target.value)} autoFocus placeholder="Enter your name" className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance text-center w-full bg-slate-500" />
                      <div className="flex space-x-2">
                        <Button onClick={handleNameUpdate} size="sm" className="bg-health hover:bg-health/90 text-white rounded-balance">
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                      setEditingName(false);
                      setNewName(settings.userName);
                    }} className="rounded-balance">
                          Cancel
                        </Button>
                      </div>
                    </div> : <div>
                      <h2 className="text-xl font-semibold text-balance-text-primary mb-3 truncate max-w-xs mx-auto">
                        {settings.userName}
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => setEditingName(true)} className="text-sm text-balance-text-muted hover:text-balance-text-primary bg-balance-surface-elevated/50 hover:bg-balance-surface-elevated rounded-lg px-4 py-2 font-medium transition-all">
                        Edit Name
                      </Button>
                    </div>}
                </div>

                {/* Decorative dots only */}
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-3 h-3 bg-health rounded-full animate-pulse" />
                  <div className="w-3 h-3 bg-relationships rounded-full animate-pulse" style={{
                  animationDelay: '0.5s'
                }} />
                  <div className="w-3 h-3 bg-work rounded-full animate-pulse" style={{
                  animationDelay: '1s'
                }} />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Analytics CTA */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2,
          duration: 0.3
        }} className="space-y-4">
            <Button onClick={() => navigate('/analytics')} className="w-full bg-gradient-to-r from-health via-relationships to-work text-white rounded-balance h-20 text-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <BarChart3 className="w-8 h-8 mr-3" />
              <div className="flex flex-col">
                <span>Check My Balance</span>
                <span className="text-sm opacity-90">View your analytics & progress</span>
              </div>
            </Button>

            {/* Animated background elements */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-health/10 via-relationships/10 to-work/10 p-4">
              <div className="absolute inset-0 bg-gradient-to-r from-health/5 via-relationships/5 to-work/5 animate-pulse" />
              <div className="relative">
                <h3 className="text-sm font-medium text-balance-text-primary mb-1">Your Balance Journey</h3>
                <p className="text-xs text-balance-text-secondary">
                  Track your progress across life pillars and discover daily balance insights.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </ScrollArea>
    </div>;
};