import * as React from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Base Skeleton
// ---------------------------------------------------------------------------

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render as a circle (e.g. avatar placeholder) */
  circle?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, circle = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'animate-pulse bg-brown/10',
        circle ? 'rounded-full' : 'rounded-md',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
);
Skeleton.displayName = 'Skeleton';

// ---------------------------------------------------------------------------
// Convenience composition components
// ---------------------------------------------------------------------------

/** A single-line text placeholder */
const SkeletonText = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Skeleton
      ref={ref}
      className={cn('h-4 w-full', className)}
      {...props}
    />
  )
);
SkeletonText.displayName = 'SkeletonText';

/** A square / rectangular image/banner placeholder */
const SkeletonImage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Skeleton
      ref={ref}
      className={cn('h-48 w-full rounded-lg', className)}
      {...props}
    />
  )
);
SkeletonImage.displayName = 'SkeletonImage';

/** A circular avatar placeholder */
const SkeletonAvatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Skeleton
      circle
      ref={ref}
      className={cn('h-10 w-10', className)}
      {...props}
    />
  )
);
SkeletonAvatar.displayName = 'SkeletonAvatar';

/** A full card-shaped placeholder */
const SkeletonCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('rounded-lg border border-brown/10 bg-white p-6 space-y-4', className)}
    aria-hidden="true"
    {...props}
  >
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
);
SkeletonCard.displayName = 'SkeletonCard';

export { Skeleton, SkeletonText, SkeletonImage, SkeletonAvatar, SkeletonCard };
