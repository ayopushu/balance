/**
 * Analytics Screen - Balance analytics with chart types
 * Shows progress analytics with empty state support
 */

import React, { useState } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBalanceStore } from '@/store';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CHART_TYPES = [
  { id: 'donut', name: 'Donut Chart', icon: '🍩' },
  { id: 'radar', name: 'Radar Chart', icon: '🎯' },
  { id: 'bar', name: 'Bar Chart', icon: '📊' },
  { id: 'line', name: 'Line Chart', icon: '📈' },
];

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { pillars, dayPlans, settings, updateSettings } = useBalanceStore();
  
  const [selectedChartType, setSelectedChartType] = useState(settings.chartType);

  // Sample analytics data (empty state friendly)
  const analyticsData = {
    totalDays: Object.keys(dayPlans).length,
    completedTasks: 0,
    totalMinutes: 0,
    pillarStats: pillars.map(pillar => ({
      id: pillar.id,
      name: pillar.name,
      color: pillar.color,
      completed: 0,
      total: 0,
      minutes: 0,
      percentage: 0,
    })),
  };

  // Calculate actual data if available
  Object.values(dayPlans).forEach(dayPlan => {
    analyticsData.completedTasks += dayPlan.items.filter(item => item.status === 'done').length;
    
    dayPlan.items.forEach(item => {
      if (item.status === 'done' && item.minutes) {
        analyticsData.totalMinutes += item.minutes;
      }
      
      const pillarStat = analyticsData.pillarStats.find(p => p.id === item.pillarId);
      if (pillarStat) {
        pillarStat.total++;
        if (item.status === 'done') {
          pillarStat.completed++;
          if (item.minutes) pillarStat.minutes += item.minutes;
        }
        pillarStat.percentage = pillarStat.total > 0 ? (pillarStat.completed / pillarStat.total) * 100 : 0;
      }
    });
  });

  const handleChartTypeChange = (chartType: 'donut' | 'radar' | 'bar' | 'line') => {
    setSelectedChartType(chartType);
    updateSettings({ chartType });
  };

  const EmptyChart = ({ type }: { type: string }) => (
    <div className="h-64 flex flex-col items-center justify-center surface rounded-balance border-2 border-dashed border-balance-surface-elevated">
      <div className="text-4xl mb-2">{CHART_TYPES.find(c => c.id === type)?.icon}</div>
      <h3 className="heading-sm text-balance-text-secondary mb-2">{CHART_TYPES.find(c => c.id === type)?.name}</h3>
      <p className="body-sm text-balance-text-muted text-center max-w-xs">
        Complete some tasks to see your {type} chart visualization here
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-balance-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-balance-background/95 backdrop-blur-sm border-b border-balance-surface-elevated">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="text-balance-text-muted hover:text-balance-text-primary"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="heading-lg text-balance-text-primary">Analytics</h1>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Chart Type Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="surface p-4">
              <div className="flex items-center justify-between">
                <h3 className="heading-sm text-balance-text-primary">Chart Type</h3>
                <Select value={selectedChartType} onValueChange={handleChartTypeChange}>
                  <SelectTrigger className="w-[180px] bg-balance-surface-elevated border-balance-surface-elevated rounded-balance-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHART_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-2">
                          <span>{type.icon}</span>
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="surface p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-health/20 rounded-balance flex items-center justify-center">
                    <Target className="w-5 h-5 text-health" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-balance-text-primary">
                      {analyticsData.completedTasks}
                    </div>
                    <div className="body-sm text-balance-text-muted">Completed</div>
                  </div>
                </div>
              </Card>

              <Card className="surface p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-relationships/20 rounded-balance flex items-center justify-center">
                    <Clock className="w-5 h-5 text-relationships" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-balance-text-primary">
                      {Math.round(analyticsData.totalMinutes / 60)}h
                    </div>
                    <div className="body-sm text-balance-text-muted">Total Time</div>
                  </div>
                </div>
              </Card>

              <Card className="surface p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-work/20 rounded-balance flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-work" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-balance-text-primary">
                      {analyticsData.totalDays}
                    </div>
                    <div className="body-sm text-balance-text-muted">Active Days</div>
                  </div>
                </div>
              </Card>

              <Card className="surface p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-balance flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-balance-text-primary">
                      {analyticsData.pillarStats.length}
                    </div>
                    <div className="body-sm text-balance-text-muted">Pillars</div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Card className="surface p-6">
              <h3 className="heading-sm text-balance-text-primary mb-4">
                Balance Overview - {CHART_TYPES.find(c => c.id === selectedChartType)?.name}
              </h3>
              <EmptyChart type={selectedChartType} />
            </Card>
          </motion.div>

          {/* Pillar Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Card className="surface p-6">
              <h3 className="heading-sm text-balance-text-primary mb-4">Pillar Progress</h3>
              <div className="space-y-4">
                {analyticsData.pillarStats.map((pillar) => (
                  <div key={pillar.id} className="flex items-center space-x-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: pillar.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="body-md text-balance-text-primary">{pillar.name}</span>
                        <span className="body-sm text-balance-text-muted">
                          {pillar.completed}/{pillar.total} ({pillar.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-balance-surface-elevated rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${pillar.percentage}%`,
                            backgroundColor: pillar.color 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {analyticsData.pillarStats.every(p => p.total === 0) && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <h4 className="heading-sm text-balance-text-secondary mb-2">No Data Yet</h4>
                  <p className="body-md text-balance-text-muted">
                    Start completing tasks to see your pillar progress breakdown
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};