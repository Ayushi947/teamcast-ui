import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

export default function AreasOfImprovementsCard({
  values,
  className,
}: {
  values?: string | string[] | null | undefined;
  className?: string;
}) {
  // Normalize the input to always be an array
  const normalizedValues = (() => {
    if (!values) return [];
    if (typeof values === 'string') return [values];
    if (Array.isArray(values)) return values.filter(Boolean); // Remove empty strings
    return [];
  })();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-3">
        {normalizedValues.length > 0 ? (
          <div
            className={cn('grid grid-cols-1 gap-2 md:grid-cols-2', className)}
          >
            {normalizedValues.map((value, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-md border border-orange-100 bg-orange-50 px-4 py-2 dark:border-orange-800 dark:bg-orange-900/20"
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-500" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-md border border-yellow-100 bg-yellow-50 px-4 py-2 dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
            <span className="text-sm text-gray-900 dark:text-white">
              No areas for improvement found
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
