/**
 * Profile Screen - User settings, analytics access, and data management
 * Shows user info, settings, and analytics CTA
 */

import React, { useState } from 'react';
import { User, BarChart3, Settings, Moon, Sun, Palette, Download, Upload, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBalanceStore } from '@/store';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export const Profile: React.FC = () => {
  const {
    settings,
    updateSettings,
    pillars,
    resetData,
    exportData,
    importData,
  } = useBalanceStore();
  
  const { toast } = useToast();

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetStep, setResetStep] = useState(0);
  const [resetConfirmText, setResetConfirmText] = useState('');
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

  // Handle theme toggle
  const handleThemeToggle = (checked: boolean) => {
    updateSettings({ darkMode: checked });
    // Apply theme to document
    document.documentElement.classList.toggle('dark', checked);
    toast({
      title: `${checked ? 'Dark' : 'Light'} mode enabled`,
      description: `Switched to ${checked ? 'dark' : 'light'} theme.`,
    });
  };

  // Handle data export
  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `balance-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported",
        description: "Your Balance data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  // Handle data import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = importData(data);
        
        if (success) {
          toast({
            title: "Data imported",
            description: "Your Balance data has been restored successfully.",
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file format is invalid or corrupted.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  // Handle reset confirmation
  const handleResetStep = () => {
    if (resetStep === 0) {
      setResetStep(1);
    } else if (resetStep === 1) {
      setResetStep(2);
    } else if (resetStep === 2 && resetConfirmText === 'RESET') {
      resetData();
      setShowResetDialog(false);
      setResetStep(0);
      setResetConfirmText('');
      toast({
        title: "Data reset",
        description: "All your data has been reset to defaults.",
        variant: "destructive",
      });
    }
  };

  const canProceedReset = resetStep < 2 || resetConfirmText === 'RESET';

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
            <Card className="surface p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-health to-relationships rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex-1">
                  {editingName ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm"
                        autoFocus
                      />
                      <Button onClick={handleNameUpdate} size="sm">
                        Save
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingName(false);
                          setNewName(settings.userName);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h2 className="heading-md text-balance-text-primary">
                        {settings.userName}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingName(true)}
                        className="text-balance-text-muted hover:text-balance-text-primary p-0 h-auto"
                      >
                        Edit name
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Analytics CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Button className="w-full bg-gradient-to-r from-health to-relationships text-white rounded-balance h-16 text-lg font-semibold hover:opacity-90 transition-balance">
              <BarChart3 className="w-6 h-6 mr-3" />
              Check My Balance
            </Button>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Card className="surface p-6">
              <h3 className="heading-sm text-balance-text-primary mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </h3>
              
              <div className="space-y-6">
                {/* Theme toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {settings.darkMode ? (
                      <Moon className="w-5 h-5 text-balance-text-secondary" />
                    ) : (
                      <Sun className="w-5 h-5 text-balance-text-secondary" />
                    )}
                    <div>
                      <Label className="body-md text-balance-text-primary">
                        Dark Mode
                      </Label>
                      <p className="body-sm text-balance-text-muted">
                        Switch between light and dark themes
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={handleThemeToggle}
                  />
                </div>

                {/* Chart type preference */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-balance-text-secondary" />
                    <div>
                      <Label className="body-md text-balance-text-primary">
                        Analytics Chart Type
                      </Label>
                      <p className="body-sm text-balance-text-muted">
                        Default chart view for analytics
                      </p>
                    </div>
                  </div>
                  <Select
                    value={settings.chartType}
                    onValueChange={(value: 'donut' | 'radar' | 'bar' | 'line') => 
                      updateSettings({ chartType: value })
                    }
                  >
                    <SelectTrigger className="w-[120px] bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donut">Donut</SelectItem>
                      <SelectItem value="radar">Radar</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="line">Line</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Special rollover */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="w-5 h-5 text-balance-text-secondary" />
                    <div>
                      <Label className="body-md text-balance-text-primary">
                        Special Rollover
                      </Label>
                      <p className="body-sm text-balance-text-muted">
                        Move missed specials to next day
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.specialRollOver}
                    onCheckedChange={(checked) => 
                      updateSettings({ specialRollOver: checked })
                    }
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Card className="surface p-6">
              <h3 className="heading-sm text-balance-text-primary mb-4">
                Data Management
              </h3>
              
              <div className="space-y-4">
                {/* Export data */}
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="w-full justify-start text-balance-text-primary border-balance-surface-elevated rounded-balance hover:bg-balance-surface-elevated"
                >
                  <Download className="w-5 h-5 mr-3" />
                  Export JSON Backup
                </Button>

                {/* Import data */}
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="import-file"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('import-file')?.click()}
                    className="w-full justify-start text-balance-text-primary border-balance-surface-elevated rounded-balance hover:bg-balance-surface-elevated"
                  >
                    <Upload className="w-5 h-5 mr-3" />
                    Import JSON Backup
                  </Button>
                </div>

                {/* Reset data */}
                <Button
                  variant="outline"
                  onClick={() => setShowResetDialog(true)}
                  className="w-full justify-start text-red-500 border-red-500/20 rounded-balance hover:bg-red-500/10"
                >
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  Reset All Data
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </ScrollArea>

      {/* Reset confirmation dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-balance-surface border-balance-surface-elevated">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {resetStep === 0 && "Reset All Data?"}
              {resetStep === 1 && "Are you absolutely sure?"}
              {resetStep === 2 && "Final Confirmation"}
            </DialogTitle>
            <DialogDescription className="text-balance-text-secondary">
              {resetStep === 0 && "This will permanently delete all your Balance data including pillars, tasks, logs, and settings."}
              {resetStep === 1 && "This action cannot be undone. All your progress, analytics, and custom configurations will be lost forever."}
              {resetStep === 2 && "Type 'RESET' below to confirm this irreversible action."}
            </DialogDescription>
          </DialogHeader>

          {resetStep === 2 && (
            <div className="py-4">
              <Input
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="Type RESET to confirm"
                className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowResetDialog(false);
                setResetStep(0);
                setResetConfirmText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetStep}
              disabled={!canProceedReset}
            >
              {resetStep === 0 && "Continue"}
              {resetStep === 1 && "I understand"}
              {resetStep === 2 && "Reset Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};