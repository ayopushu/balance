import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface IOSTimePickerProps {
  value?: string; // HH:MM format
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export const IOSTimePicker: React.FC<IOSTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  // Initialize from value
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':').map(Number);
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [value]);

  // Scroll to selected values when opening
  useEffect(() => {
    if (isOpen && hourScrollRef.current && minuteScrollRef.current) {
      setTimeout(() => {
        const hourElement = hourScrollRef.current?.children[selectedHour] as HTMLElement;
        const minuteElement = minuteScrollRef.current?.children[Math.floor(selectedMinute / 5)] as HTMLElement;
        
        if (hourElement) {
          hourScrollRef.current?.scrollTo({
            top: hourElement.offsetTop - hourScrollRef.current.offsetTop - 48,
            behavior: 'smooth'
          });
        }
        
        if (minuteElement) {
          minuteScrollRef.current?.scrollTo({
            top: minuteElement.offsetTop - minuteScrollRef.current.offsetTop - 48,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [isOpen, selectedHour, selectedMinute]);

  const handleTimeSelect = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onChange(timeString);
    setIsOpen(false);
  };

  const formatDisplayTime = () => {
    if (!value) return placeholder;
    return value;
  };

  const handleHourScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = 48; // Height of each time item
    const centerIndex = Math.round(scrollTop / itemHeight);
    if (centerIndex >= 0 && centerIndex < 24) {
      setSelectedHour(centerIndex);
    }
  };

  const handleMinuteScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = 48; // Height of each time item
    const centerIndex = Math.round(scrollTop / itemHeight);
    const minute = centerIndex * 5;
    if (minute >= 0 && minute < 60) {
      setSelectedMinute(minute);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${!value && "text-balance-text-muted"} ${className}`}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="bg-balance-surface border border-balance-surface-elevated rounded-lg p-4 shadow-lg">
          <div className="text-center mb-4">
            <h4 className="text-sm font-medium text-balance-text-primary mb-2">Select Time</h4>
            <div className="text-2xl font-light text-balance-text-primary">
              {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
            </div>
          </div>
          
          <div className="flex justify-center space-x-8 relative">
            {/* Hour selector */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-balance-text-muted mb-2 font-medium">Hour</p>
              <div className="relative">
                {/* Selection indicator */}
                <div className="absolute top-12 left-0 right-0 h-12 bg-health/10 border-t border-b border-health/30 pointer-events-none z-10 rounded-md" />
                
                <div 
                  ref={hourScrollRef}
                  onScroll={handleHourScroll}
                  className="w-16 h-36 overflow-y-scroll scrollbar-hide bg-balance-surface-elevated/50 rounded-lg"
                  style={{
                    scrollSnapType: 'y mandatory',
                    scrollBehavior: 'smooth'
                  }}
                >
                  {/* Padding items */}
                  <div className="h-12" />
                  <div className="h-12" />
                  
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedHour(i)}
                      className={`h-12 flex items-center justify-center cursor-pointer transition-all text-lg font-light ${
                        selectedHour === i 
                          ? 'text-health font-medium scale-110' 
                          : 'text-balance-text-muted hover:text-balance-text-primary'
                      }`}
                      style={{ scrollSnapAlign: 'center' }}
                    >
                      {i.toString().padStart(2, '0')}
                    </div>
                  ))}
                  
                  {/* Padding items */}
                  <div className="h-12" />
                  <div className="h-12" />
                </div>
              </div>
            </div>
            
            {/* Minute selector */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-balance-text-muted mb-2 font-medium">Minute</p>
              <div className="relative">
                {/* Selection indicator */}
                <div className="absolute top-12 left-0 right-0 h-12 bg-health/10 border-t border-b border-health/30 pointer-events-none z-10 rounded-md" />
                
                <div 
                  ref={minuteScrollRef}
                  onScroll={handleMinuteScroll}
                  className="w-16 h-36 overflow-y-scroll scrollbar-hide bg-balance-surface-elevated/50 rounded-lg"
                  style={{
                    scrollSnapType: 'y mandatory',
                    scrollBehavior: 'smooth'
                  }}
                >
                  {/* Padding items */}
                  <div className="h-12" />
                  <div className="h-12" />
                  
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                    <div
                      key={minute}
                      onClick={() => setSelectedMinute(minute)}
                      className={`h-12 flex items-center justify-center cursor-pointer transition-all text-lg font-light ${
                        selectedMinute === minute 
                          ? 'text-health font-medium scale-110' 
                          : 'text-balance-text-muted hover:text-balance-text-primary'
                      }`}
                      style={{ scrollSnapAlign: 'center' }}
                    >
                      {minute.toString().padStart(2, '0')}
                    </div>
                  ))}
                  
                  {/* Padding items */}
                  <div className="h-12" />
                  <div className="h-12" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleTimeSelect}
              className="flex-1 bg-health hover:bg-health/90 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};