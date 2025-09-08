import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TimePickerProps {
  value?: string; // HH:MM format
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  // Initialize from value
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':').map(Number);
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [value]);

  const handleTimeSelect = (hour: number, minute: number) => {
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onChange(timeString);
    setIsOpen(false);
  };

  const formatDisplayTime = () => {
    if (!value) return placeholder;
    return value;
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
        <div className="bg-balance-surface border border-balance-surface-elevated rounded-lg p-4">
          <div className="text-center mb-4">
            <h4 className="text-sm font-medium text-balance-text-primary mb-2">Select Time</h4>
            <div className="text-lg font-semibold text-balance-text-primary">
              {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
            </div>
          </div>
          
          <div className="flex space-x-4">
            {/* Hour selector */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-balance-text-muted mb-2">Hours</p>
              <div className="relative w-16 h-32 overflow-y-auto border border-balance-surface-elevated rounded bg-balance-surface-elevated">
                {Array.from({ length: 24 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedHour(i)}
                    className={`w-full px-2 py-1 text-sm hover:bg-balance-surface-elevated transition-colors ${
                      selectedHour === i ? 'bg-health text-white' : 'text-balance-text-primary'
                    }`}
                  >
                    {i.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Minute selector */}
            <div className="flex flex-col items-center">
              <p className="text-xs text-balance-text-muted mb-2">Minutes</p>
              <div className="relative w-16 h-32 overflow-y-auto border border-balance-surface-elevated rounded bg-balance-surface-elevated">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <button
                    key={minute}
                    onClick={() => setSelectedMinute(minute)}
                    className={`w-full px-2 py-1 text-sm hover:bg-balance-surface-elevated transition-colors ${
                      selectedMinute === minute ? 'bg-health text-white' : 'text-balance-text-primary'
                    }`}
                  >
                    {minute.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
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
              onClick={() => handleTimeSelect(selectedHour, selectedMinute)}
              className="flex-1 bg-health hover:bg-health/90 text-white"
            >
              Select
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};