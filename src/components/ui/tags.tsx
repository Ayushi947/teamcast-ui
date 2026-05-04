import { FC, ReactNode } from 'react';

interface TagsProps {
  tags?: string; // Optional comma-separated string
  children?: ReactNode;
  className?: string;
}

export const Tags: FC<TagsProps> = ({ tags = '', children, className }) => {
  const tagList =
    typeof tags === 'string'
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];

  if (tagList.length === 0 && !children) return null;

  return (
    <div
      className={`flex flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${className}`}
    >
      {tagList.map((tag, index) => (
        <span key={`${tag}-${index}`} className="px-2 py-1 text-sm font-medium">
          {tag}
        </span>
      ))}
      {children}
    </div>
  );
};
