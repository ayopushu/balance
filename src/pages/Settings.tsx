/**
 * Settings Screen - Life pillars management, data import/export, reset
 * Manage pillars, colors, and data operations
 */

import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Download, Upload, AlertTriangle, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBalanceStore } from '@/store';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
const PILLAR_COLORS = [{
  name: 'Green',
  value: '#4CAF50',
  id: 'green'
}, {
  name: 'Pink',
  value: '#FF69B4',
  id: 'pink'
}, {
  name: 'Yellow',
  value: '#FFC107',
  id: 'yellow'
}, {
  name: 'Blue',
  value: '#2196F3',
  id: 'blue'
}, {
  name: 'Purple',
  value: '#9C27B0',
  id: 'purple'
}, {
  name: 'Red',
  value: '#F44336',
  id: 'red'
}];
export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {
    pillars,
    addPillar,
    updatePillar,
    deletePillar,
    resetData,
    exportData,
    importData,
    settings,
    updateSettings
  } = useBalanceStore();
  const {
    toast
  } = useToast();
  const [editingPillar, setEditingPillar] = useState<string | null>(null);
  const [newPillarName, setNewPillarName] = useState('');
  const [newPillarColor, setNewPillarColor] = useState(PILLAR_COLORS[0].value);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetStep, setResetStep] = useState(0);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(settings.userName);

  // Handle pillar name update
  const handlePillarUpdate = (pillarId: string, newName: string) => {
    updatePillar(pillarId, {
      name: newName
    });
    setEditingPillar(null);
    toast({
      title: "Pillar updated",
      description: "Pillar name has been saved successfully."
    });
  };

  // Handle pillar color update
  const handleColorUpdate = (pillarId: string, color: string) => {
    updatePillar(pillarId, {
      color
    });
    toast({
      title: "Color updated",
      description: "Pillar color has been updated."
    });
  };

  // Handle add new pillar
  const handleAddPillar = () => {
    if (!newPillarName.trim()) return;
    addPillar({
      name: newPillarName,
      color: newPillarColor,
      order: pillars.length
    });
    setNewPillarName('');
    setNewPillarColor(PILLAR_COLORS[0].value);
    setShowAddDialog(false);
    toast({
      title: "Pillar added",
      description: "New pillar has been created successfully."
    });
  };

  // Handle pillar deletion
  const handleDeletePillar = (pillarId: string) => {
    deletePillar(pillarId);
    setShowDeleteDialog(null);
    toast({
      title: "Pillar deleted",
      description: "Pillar has been removed successfully.",
      variant: "destructive"
    });
  };

  // Handle data export
  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], {
        type: 'application/json'
      });
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
        description: "Your Balance data has been downloaded successfully."
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
  };

  // Handle data import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = e.target?.result as string;
        const success = importData(data);
        if (success) {
          toast({
            title: "Data imported",
            description: "Your Balance data has been restored successfully."
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file format is invalid or corrupted.",
          variant: "destructive"
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
        variant: "destructive"
      });
    }
  };
  const canProceedReset = resetStep < 2 || resetConfirmText === 'RESET';

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
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-balance-text-muted hover:text-balance-text-primary">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="heading-lg text-balance-text-primary">Settings</h1>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* User Name Management */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
            <Card className="surface p-6">
              <h3 className="heading-sm text-balance-text-primary mb-4">
                User Profile
              </h3>
              
              {editingName ? <div className="flex items-center space-x-3">
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter your name" autoFocus className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm flex-1 bg-slate-500" />
                  <Button onClick={handleNameUpdate} size="sm" className="bg-health hover:bg-health/90 text-white rounded-balance">
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                setEditingName(false);
                setNewName(settings.userName);
              }} className="rounded-balance">
                    Cancel
                  </Button>
                </div> : <div className="flex items-center justify-between p-3 surface-elevated rounded-balance">
                  <span className="body-md text-balance-text-primary">{settings.userName}</span>
                  <Button variant="ghost" size="sm" onClick={() => setEditingName(true)} className="text-balance-text-muted hover:text-balance-text-primary">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>}
            </Card>
          </motion.div>

          {/* Life Pillars Management */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
            <Card className="surface p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="heading-sm text-balance-text-primary">
                  Life Pillars
                </h3>
                <Button onClick={() => setShowAddDialog(true)} size="sm" className="bg-health hover:bg-health/90 text-white rounded-balance">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pillar
                </Button>
              </div>
              
              <div className="space-y-4">
                {pillars.map(pillar => <div key={pillar.id} className="flex items-center space-x-4 p-3 surface-elevated rounded-balance">
                    <div className="w-6 h-6 rounded-full" style={{
                  backgroundColor: pillar.color
                }} />
                    
                    {editingPillar === pillar.id ? <div className="flex-1 flex items-center space-x-2">
                        <Input defaultValue={pillar.name} onBlur={e => handlePillarUpdate(pillar.id, e.target.value)} onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handlePillarUpdate(pillar.id, e.currentTarget.value);
                    }
                  }} className="bg-balance-surface border-balance-surface-elevated rounded-balance-sm" autoFocus />
                      </div> : <div className="flex-1">
                        <span className="body-md text-balance-text-primary">{pillar.name}</span>
                      </div>}
                    
                    <Select value={pillar.color} onValueChange={color => handleColorUpdate(pillar.id, color)}>
                      <SelectTrigger className="w-[40px] bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm p-2">
                        <Palette className="w-4 h-4" />
                      </SelectTrigger>
                      <SelectContent>
                        {PILLAR_COLORS.map(color => <SelectItem key={color.id} value={color.value}>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded-full" style={{
                          backgroundColor: color.value
                        }} />
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    
                    <Button variant="ghost" size="sm" onClick={() => setEditingPillar(pillar.id)} className="text-balance-text-muted hover:text-balance-text-primary">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    
                    <Button variant="ghost" size="sm" onClick={() => setShowDeleteDialog(pillar.id)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>)}
              </div>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1,
          duration: 0.3
        }}>
            <Card className="surface p-6">
              <h3 className="heading-sm text-balance-text-primary mb-4">
                Notifications
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 surface-elevated rounded-balance">
                  <div className="flex-1">
                    <h4 className="body-md font-medium text-balance-text-primary mb-1">
                      Task Reminders
                    </h4>
                    <p className="text-sm text-balance-text-muted">
                      Get notified when tasks are due
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      console.log('🔔 Toggle clicked');
                      console.log('Current state:', settings.notificationsEnabled);
                      console.log('Browser permission:', Notification.permission);
                      
                      const currentlyEnabled = settings.notificationsEnabled;
                      
                      if (!currentlyEnabled) {
                        // User wants to enable notifications
                        console.log('📱 Attempting to enable notifications...');
                        
                        // Check browser support
                        if (!('Notification' in window)) {
                          console.log('❌ Notifications not supported');
                          toast({
                            title: "Not supported",
                            description: "Notifications are not supported on this device.",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Check permission status
                        if (Notification.permission === 'denied') {
                          console.log('❌ Permission denied by browser');
                          toast({
                            title: "Notifications Blocked",
                            description: "Enable notifications in your browser settings to use this feature.",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Request permission if needed
                        if (Notification.permission === 'default') {
                          console.log('📋 Requesting permission...');
                          const permission = await Notification.requestPermission();
                          console.log('📋 Permission result:', permission);
                          
                          if (permission !== 'granted') {
                            console.log('❌ User denied permission');
                            toast({
                              title: "Permission denied",
                              description: "Notification permission was not granted.",
                              variant: "destructive",
                            });
                            return;
                          }
                        }

                        // Enable notifications
                        console.log('✅ Enabling notifications in app state');
                        updateSettings({ notificationsEnabled: true });
                        console.log('✅ State updated to:', true);
                        
                        toast({
                          title: "Notifications enabled",
                          description: "You'll be reminded about your scheduled tasks.",
                        });
                      } else {
                        // User wants to disable notifications
                        console.log('🔕 Disabling notifications...');
                        updateSettings({ notificationsEnabled: false });
                        console.log('✅ State updated to:', false);
                        
                        toast({
                          title: "Notifications disabled",
                          description: "Task reminders have been turned off.",
                        });
                      }
                    }}
                    className="relative inline-flex items-center cursor-pointer"
                    type="button"
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      settings.notificationsEnabled ? 'bg-health' : 'bg-balance-surface-elevated'
                    }`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform ${
                        settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </button>
                </div>

                {/* Status indicator */}
                <div className="p-3 surface-elevated rounded-balance">
                  {settings.notificationsEnabled && ('Notification' in window) && Notification.permission === 'granted' && (
                    <div className="flex items-center text-health text-sm">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Notifications are enabled
                    </div>
                  )}
                  {!settings.notificationsEnabled && (
                    <div className="text-balance-text-muted text-sm">
                      Notifications are off
                    </div>
                  )}
                  {settings.notificationsEnabled && ('Notification' in window) && Notification.permission === 'denied' && (
                    <div className="flex items-start text-yellow-500 text-sm">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-medium">Notifications blocked</div>
                        <div className="text-xs text-balance-text-muted mt-1">
                          Enable in browser settings to receive reminders
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.15,
          duration: 0.3
        }}>
            <Card className="surface p-6">
              <h3 className="heading-sm text-balance-text-primary mb-4">
                Data Management
              </h3>
              
              <div className="space-y-4">
                {/* Export data */}
                <Button variant="outline" onClick={handleExport} className="w-full justify-start text-balance-text-primary border-balance-surface-elevated rounded-balance hover:bg-balance-surface-elevated">
                  <Download className="w-5 h-5 mr-3" />
                  Export JSON Backup
                </Button>

                {/* Import data */}
                <div>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
                  <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()} className="w-full justify-start text-balance-text-primary border-balance-surface-elevated rounded-balance hover:bg-balance-surface-elevated">
                    <Upload className="w-5 h-5 mr-3" />
                    Import JSON Backup
                  </Button>
                </div>

                {/* Reset data */}
                <Button variant="outline" onClick={() => setShowResetDialog(true)} className="w-full justify-start text-red-500 border-red-500/20 rounded-balance hover:bg-red-500/10">
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  Reset All Data
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </ScrollArea>

      {/* Add Pillar Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-balance-surface border-balance-surface-elevated">
          <DialogHeader>
            <DialogTitle className="text-balance-text-primary">Add New Pillar</DialogTitle>
            <DialogDescription className="text-balance-text-secondary">
              Create a new life pillar to organize your activities.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="body-md text-balance-text-primary">Pillar Name</Label>
              <Input value={newPillarName} onChange={e => setNewPillarName(e.target.value)} placeholder="Enter pillar name" className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm mt-2 bg-slate-500" />
            </div>
            
            <div>
              <Label className="body-md text-balance-text-primary">Color</Label>
              <Select value={newPillarColor} onValueChange={setNewPillarColor}>
                <SelectTrigger className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PILLAR_COLORS.map(color => <SelectItem key={color.id} value={color.value}>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full" style={{
                      backgroundColor: color.value
                    }} />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPillar} disabled={!newPillarName.trim()} className="bg-health hover:bg-health/90 text-white">
              Add Pillar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Pillar Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent className="bg-balance-surface border-balance-surface-elevated">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Delete Pillar?
            </DialogTitle>
            <DialogDescription className="text-balance-text-secondary">
              This will permanently delete this pillar and all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => showDeleteDialog && handleDeletePillar(showDeleteDialog)}>
              Delete Pillar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

          {resetStep === 2 && <div className="py-4">
              <Input value={resetConfirmText} onChange={e => setResetConfirmText(e.target.value)} placeholder="Type RESET to confirm" className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm" />
            </div>}

          <DialogFooter>
            <Button variant="ghost" onClick={() => {
            setShowResetDialog(false);
            setResetStep(0);
            setResetConfirmText('');
          }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetStep} disabled={!canProceedReset}>
              {resetStep === 0 && "Continue"}
              {resetStep === 1 && "I understand"}
              {resetStep === 2 && "Reset Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};