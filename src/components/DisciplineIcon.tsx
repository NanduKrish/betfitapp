import React from 'react';
import { DisciplineType } from '../types';
import {
  Dumbbell,
  Waves,
  Footprints,
  Bike,
  Activity,
  Apple,
  Zap,
  Target
} from 'lucide-react';

interface DisciplineIconProps {
  discipline: DisciplineType;
  className?: string;
  size?: number;
}

export const DisciplineIcon: React.FC<DisciplineIconProps> = ({
  discipline,
  className = 'w-4 h-4',
  size
}) => {
  switch (discipline) {
    case 'gym':
      return <Dumbbell className={className} size={size} />;
    case 'swimming':
      return <Waves className={className} size={size} />;
    case 'running':
      return <Footprints className={className} size={size} />;
    case 'cycling':
      return <Bike className={className} size={size} />;
    case 'walking':
      return <Activity className={className} size={size} />;
    case 'diet':
      return <Apple className={className} size={size} />;
    case 'calisthenics':
      return <Zap className={className} size={size} />;
    case 'custom':
    default:
      return <Target className={className} size={size} />;
  }
};
