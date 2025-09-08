/**
 * OnboardingDialog Component - First-time user setup
 * Collects username and life pillars for initial app configuration
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, X, ChevronRight, Palette } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import type { Pillar } from '@/store/types';
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
interface OnboardingDialogProps {
  isOpen: boolean;
  onComplete: (userName: string, pillars: Omit<Pillar, 'id'>[]) => void;
}
export const OnboardingDialog: React.FC<OnboardingDialogProps> = ({
  isOpen,
  onComplete
}) => {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [pillars, setPillars] = useState<Omit<Pillar, 'id'>[]>([{
    name: 'Health',
    color: '#4CAF50',
    order: 0
  }, {
    name: 'Relationships',
    color: '#FF69B4',
    order: 1
  }, {
    name: 'Work',
    color: '#FFC107',
    order: 2
  }]);
  const [newPillarName, setNewPillarName] = useState('');
  const [newPillarColor, setNewPillarColor] = useState(PILLAR_COLORS[0].value);
  const handleNext = () => {
    if (step === 1 && userName.trim()) {
      setStep(2);
    }
  };
  const handleAddPillar = () => {
    if (newPillarName.trim()) {
      setPillars(prev => [...prev, {
        name: newPillarName,
        color: newPillarColor,
        order: prev.length
      }]);
      setNewPillarName('');
      setNewPillarColor(PILLAR_COLORS[0].value);
    }
  };
  const handleRemovePillar = (index: number) => {
    setPillars(prev => prev.filter((_, i) => i !== index).map((pillar, i) => ({
      ...pillar,
      order: i
    })));
  };
  const handleUpdatePillar = (index: number, updates: Partial<Omit<Pillar, 'id'>>) => {
    setPillars(prev => prev.map((pillar, i) => i === index ? {
      ...pillar,
      ...updates
    } : pillar));
  };
  const handleComplete = () => {
    onComplete(userName, pillars);
  };
  return <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg bg-balance-surface/95 backdrop-blur-sm border-balance-surface-elevated">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-balance-text-primary text-center">
            Welcome to Balance
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {step === 1 && <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-balance-text-primary mb-2">
                  What's your name?
                </h3>
                <p className="text-sm text-balance-text-secondary">
                  We'll use this to personalize your experience
                </p>
              </div>

              <div>
                <Label htmlFor="userName" className="body-md text-balance-text-secondary">
                  Your Name
                </Label>
                <Input id="userName" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Enter your name" autoFocus className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm mt-2 text-center text-lg bg-slate-500" />
              </div>

              <Button onClick={handleNext} disabled={!userName.trim()} className="w-full bg-health hover:bg-health/90 text-white rounded-balance h-12">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>}

          {step === 2 && <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-balance-text-primary mb-2">
                  Set up your life pillars
                </h3>
                <p className="text-sm text-balance-text-secondary">
                  Organize your activities around what matters most
                </p>
              </div>

              <div className="space-y-3">
                {pillars.map((pillar, index) => <Card key={index} className="surface-elevated p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full flex-shrink-0" style={{
                  backgroundColor: pillar.color
                }} />
                      <Input value={pillar.name} onChange={e => handleUpdatePillar(index, {
                  name: e.target.value
                })} className="bg-transparent border-none p-0 text-balance-text-primary font-medium focus-visible:ring-0" />
                      <Select value={pillar.color} onValueChange={color => handleUpdatePillar(index, {
                  color
                })}>
                        <SelectTrigger className="w-[50px] bg-transparent border-none p-0">
                          <Palette className="w-4 h-4 text-balance-text-muted" />
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
                      {pillars.length > 1 && <Button variant="ghost" size="sm" onClick={() => handleRemovePillar(index)} className="text-red-500 hover:text-red-600 p-1">
                          <X className="w-4 h-4" />
                        </Button>}
                    </div>
                  </Card>)}
              </div>

              {pillars.length < 6 && <div className="flex items-center space-x-2">
                  <Input value={newPillarName} onChange={e => setNewPillarName(e.target.value)} placeholder="Add new pillar..." className="bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm flex-1 bg-slate-500" />
                  <Select value={newPillarColor} onValueChange={setNewPillarColor}>
                    <SelectTrigger className="w-[50px] bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm p-2">
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
                  <Button onClick={handleAddPillar} disabled={!newPillarName.trim()} size="sm" className="bg-health hover:bg-health/90 text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>}

              <div className="flex space-x-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 rounded-balance">
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1 bg-health hover:bg-health/90 text-white rounded-balance">
                  Get Started
                </Button>
              </div>
            </motion.div>}
        </div>
      </DialogContent>
    </Dialog>;
};