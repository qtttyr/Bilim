import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import * as Icons from '@hugeicons/core-free-icons';

// Prop type for the wrapped icon components
type IconProps = {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  [key: string]: any;
};

// Helper function to wrap a raw icon object from `@hugeicons/core-free-icons` into a React component
const createIcon = (iconData: any) => {
  if (!iconData) {
    // Fallback if an icon is missing, to avoid crashes
    return () => null;
  }
  return React.forwardRef<SVGSVGElement, IconProps>(({ size = 24, color = 'currentColor', strokeWidth = 1.5, className, ...props }, ref) => (
    <HugeiconsIcon
      ref={ref as any}
      icon={iconData}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  ));
};

// Export individual icons wrapped as React components
export const Notebook02Icon = createIcon(Icons.Notebook02Icon);
export const ShuffleIcon = createIcon(Icons.ShuffleIcon);
export const Edit01Icon = createIcon(Icons.Edit01Icon);
export const PlusSignIcon = createIcon(Icons.PlusSignIcon);
export const Task01Icon = createIcon(Icons.Task01Icon);
export const Tick01Icon = createIcon(Icons.Tick01Icon);
export const Cancel01Icon = createIcon(Icons.Cancel01Icon);
export const ArrowRight01Icon = createIcon(Icons.ArrowRight01Icon);
export const BookOpen01Icon = createIcon(Icons.BookOpen01Icon);
export const SparklesIcon = createIcon(Icons.SparklesIcon);
export const FireIcon = createIcon(Icons.FireIcon);
export const Calendar01Icon = createIcon(Icons.Calendar01Icon);
export const Brain01Icon = createIcon(Icons.Brain01Icon);
export const LayersIcon = createIcon(Icons.LayersIcon);
export const ZapIcon = createIcon(Icons.ZapIcon);
export const HourglassIcon = createIcon(Icons.HourglassIcon);
export const UserIcon = createIcon(Icons.UserIcon);
export const Notification02Icon = createIcon(Icons.Notification02Icon);
export const Sun01Icon = createIcon(Icons.Sun01Icon);
export const Moon02Icon = createIcon(Icons.Moon02Icon);
export const Download02Icon = createIcon(Icons.Download02Icon);
export const Upload02Icon = createIcon(Icons.Upload02Icon);
export const CleanIcon = createIcon(Icons.CleanIcon);
export const ArrowLeft01Icon = createIcon(Icons.ArrowLeft01Icon);
export const BookOpen02Icon = createIcon(Icons.BookOpen02Icon);
export const LinkIcon = createIcon(Icons.LinkIcon);
export const Brain02Icon = createIcon(Icons.Brain02Icon);
export const Settings01Icon = createIcon(Icons.Settings01Icon);
export const Sun03Icon = createIcon(Icons.Sun03Icon);
export const Notebook01Icon = createIcon(Icons.Notebook01Icon);

// Mapped/renamed icons to replace missing ones:
export const BubbleChatCheckIcon = createIcon(Icons.BubbleChatDoneIcon);
export const ChartBar01Icon = createIcon(Icons.BarChartIcon);
export const Help02Icon = createIcon(Icons.HelpCircleIcon);
export const TextFilesIcon = createIcon(Icons.Doc01Icon);
export const CircleAlertIcon = createIcon(Icons.AlertCircleIcon);
export const Trash01Icon = createIcon(Icons.Trash);
