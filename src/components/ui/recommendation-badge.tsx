import { Badge } from '@/components/ui/badge';
import { cn, formatEnumValue } from '@/lib/utils';
import {
  JobAiAssessmentRecommendationEnum,
  OnboardingAssessmentRecommendationEnum,
  ResumeAssessmentRecommendationEnum,
} from '@/lib/shared';

type RecommendationType =
  | JobAiAssessmentRecommendationEnum
  | OnboardingAssessmentRecommendationEnum
  | ResumeAssessmentRecommendationEnum
  | string
  | undefined;

interface RecommendationBadgeProps {
  recommendation?: RecommendationType;
  className?: string;
}

export const RecommendationBadge = ({
  recommendation,
  className,
}: RecommendationBadgeProps) => {
  const getBadgeStyles = (rec: RecommendationType) => {
    if (!rec)
      return 'bg-gray-100 text-gray-800 font-bold border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800 hover:none';

    const recString = rec.toString().toUpperCase();

    if (recString.includes('NOT_RECOMMENDED')) {
      return 'bg-red-100 text-red-800 font-bold border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 hover:none';
    }

    if (recString.includes('HIGHLY_RECOMMENDED')) {
      return 'bg-green-100 text-green-800 font-bold border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 hover:none';
    }

    if (recString.includes('RECOMMENDED')) {
      return 'bg-green-100 text-green-800 font-bold border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 hover:none';
    }

    // Default for unknown recommendations
    return 'bg-gray-100 text-gray-800 font-bold border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
  };

  return (
    <Badge
      className={cn(
        'border px-3 py-1 text-xs font-medium',
        getBadgeStyles(recommendation),
        className
      )}
    >
      {formatEnumValue(recommendation || 'Not Available')}
    </Badge>
  );
};
