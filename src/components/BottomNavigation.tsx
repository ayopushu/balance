import React from 'react';
import { NavLink } from 'react-router-dom';
import { Scale, Calendar, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-balance-surface/95 backdrop-blur-md border-t border-balance-surface-elevated">
      <div className="flex items-center justify-around py-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-4 rounded-balance-sm transition-balance ${
              isActive 
                ? 'text-health' 
                : 'text-balance-text-muted hover:text-balance-text-primary'
            }`
          }
        >
          <Scale className="w-6 h-6" />
          <span className="body-sm mt-1">Balance</span>
        </NavLink>
        
        <NavLink
          to="/plan"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-4 rounded-balance-sm transition-balance ${
              isActive 
                ? 'text-health' 
                : 'text-balance-text-muted hover:text-balance-text-primary'
            }`
          }
        >
          <Calendar className="w-6 h-6" />
          <span className="body-sm mt-1">Plan</span>
        </NavLink>
        
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-4 rounded-balance-sm transition-balance ${
              isActive 
                ? 'text-health' 
                : 'text-balance-text-muted hover:text-balance-text-primary'
            }`
          }
        >
          <User className="w-6 h-6" />
          <span className="body-sm mt-1">Profile</span>
        </NavLink>
      </div>
    </div>
  );
};