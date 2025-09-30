import React, { useRef, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';

interface ScrollableTimePickerProps {
  label: string;
  value: string; // Format: "HH:MM"
  onChange: (time: string) => void;
}

export const ScrollableTimePicker: React.FC<ScrollableTimePickerProps> = ({
  label,
  value,
  onChange,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const [selectedHour, selectedMinute] = value.split(':').map(v => v || '00');

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const ITEM_HEIGHT = 60;

  useEffect(() => {
    if (hourRef.current) {
      const hourIndex = hours.indexOf(selectedHour);
      hourRef.current.scrollTop = hourIndex * ITEM_HEIGHT;
    }
  }, [selectedHour]);

  useEffect(() => {
    if (minuteRef.current) {
      const minuteIndex = minutes.indexOf(selectedMinute);
      minuteRef.current.scrollTop = minuteIndex * ITEM_HEIGHT;
    }
  }, [selectedMinute]);

  const handleScroll = (type: 'hour' | 'minute') => {
    const ref = type === 'hour' ? hourRef.current : minuteRef.current;
    if (!ref) return;

    const scrollTop = ref.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const newValue = type === 'hour' ? hours[index] : minutes[index];

    if (type === 'hour') {
      onChange(`${newValue}:${selectedMinute}`);
    } else {
      onChange(`${selectedHour}:${newValue}`);
    }
  };

  const renderTimeColumn = (
    items: string[],
    selected: string,
    ref: React.RefObject<HTMLDivElement>,
    type: 'hour' | 'minute'
  ) => (
    <div className="relative h-[180px] w-24 overflow-hidden">
      {/* Highlight overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-full h-[60px] bg-white/5 border-y border-white/10" />
      </div>
      
      {/* Scrollable content */}
      <div
        ref={ref}
        className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        onScroll={() => handleScroll(type)}
        style={{
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
        }}
      >
        {/* Top padding */}
        <div style={{ height: `${ITEM_HEIGHT}px` }} />
        
        {items.map((item) => (
          <div
            key={item}
            className="snap-center flex items-center justify-center transition-all duration-200"
            style={{ height: `${ITEM_HEIGHT}px` }}
          >
            <span
              className={`text-3xl font-light transition-all duration-200 ${
                item === selected
                  ? 'text-white scale-110 font-normal'
                  : 'text-white/30 scale-90'
              }`}
            >
              {item}
            </span>
          </div>
        ))}
        
        {/* Bottom padding */}
        <div style={{ height: `${ITEM_HEIGHT}px` }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <Label className="text-xs text-balance-text-muted uppercase tracking-wider">
        {label}
      </Label>
      <div className="flex items-center justify-center space-x-2">
        {renderTimeColumn(hours, selectedHour, hourRef, 'hour')}
        <span className="text-3xl text-white/50 font-light">:</span>
        {renderTimeColumn(minutes, selectedMinute, minuteRef, 'minute')}
      </div>
    </div>
  );
};
