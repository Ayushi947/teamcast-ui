'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { logger } from '@/lib/logger';

interface FeedbackData {
  rating: number;
  helpful: boolean | null;
  comment: string;
  email: string;
  name: string;
}

interface Comment {
  id: string;
  name: string;
  email: string;
  comment: string;
  rating: number;
  helpful: boolean;
  timestamp: Date;
  avatar?: string;
}

interface FeedbackSystemProps {
  articleId: string;
  articleTitle: string;
  initialRating?: number;
  initialComments?: Comment[];
  onFeedbackSubmit?: (feedback: FeedbackData) => void;
}

const mockComments: Comment[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    comment:
      'This article was extremely helpful! The step-by-step instructions made it easy to follow.',
    rating: 5,
    helpful: true,
    timestamp: new Date('2024-01-10'),
    avatar: '/images/team/sarah.jpg',
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    comment:
      'Good information but could use more screenshots for visual learners.',
    rating: 4,
    helpful: true,
    timestamp: new Date('2024-01-08'),
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    comment: 'Perfect! Solved my issue in minutes. Thank you!',
    rating: 5,
    helpful: true,
    timestamp: new Date('2024-01-05'),
  },
];

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  initialComments = mockComments,
  onFeedbackSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [showAllComments, setShowAllComments] = useState(false);

  const averageRating =
    comments.reduce((sum, comment) => sum + comment.rating, 0) /
    comments.length;
  const helpfulCount = comments.filter((c) => c.helpful).length;
  const totalFeedback = comments.length;

  const handleRatingClick = (value: number) => {
    setRating(value);
    if (value <= 3) {
      setShowCommentForm(true);
    }
  };

  const handleHelpfulClick = (isHelpful: boolean) => {
    setHelpful(isHelpful);
    if (!isHelpful) {
      setShowCommentForm(true);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!rating && helpful === null) return;

    setIsSubmitting(true);

    const feedbackData: FeedbackData = {
      rating,
      helpful,
      comment,
      email,
      name,
    };

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (comment.trim()) {
        const newComment: Comment = {
          id: Date.now().toString(),
          name: name || 'Anonymous',
          email,
          comment,
          rating: rating || 5,
          helpful: helpful !== null ? helpful : true,
          timestamp: new Date(),
        };
        setComments((prev) => [newComment, ...prev]);
      }

      onFeedbackSubmit?.(feedbackData);
      setHasSubmitted(true);
      setShowCommentForm(false);
    } catch (error) {
      logger.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingEmoji = (rating: number) => {
    if (rating >= 4.5) return '😊';
    if (rating >= 3.5) return '😐';
    return '😞';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Article Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {averageRating.toFixed(1)}
              </div>
              <div className="mt-1 flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-muted-foreground mt-1 text-sm">
                {totalFeedback} review{totalFeedback !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-2 text-2xl">
                {getRatingEmoji(averageRating)}
              </div>
              <div className="text-muted-foreground text-sm">
                {helpfulCount} of {totalFeedback} found this helpful
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Form */}
      <AnimatePresence>
        {!hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Was this article helpful?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Helpful/Not Helpful */}
                <div className="flex items-center gap-4">
                  <Button
                    variant={helpful === true ? 'default' : 'outline'}
                    onClick={() => handleHelpfulClick(true)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes, helpful
                  </Button>
                  <Button
                    variant={helpful === false ? 'default' : 'outline'}
                    onClick={() => handleHelpfulClick(false)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Not helpful
                  </Button>
                </div>

                {/* Star Rating */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Rate this article
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-colors"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Form */}
                <AnimatePresence>
                  {showCommentForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <Separator />
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Tell us more (optional)
                        </label>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="What could we improve? What did you like?"
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Name (optional)
                          </label>
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Email (optional)
                          </label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                {(rating > 0 || helpful !== null || showCommentForm) && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          >
                            <Star className="h-4 w-4" />
                          </motion.div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      Thank you for your feedback!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your input helps us improve our documentation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Section */}
      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Community Feedback ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedComments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.avatar} alt={comment.name} />
                      <AvatarFallback>
                        {comment.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.name}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= comment.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                      <div className="flex items-center gap-2">
                        {comment.helpful && (
                          <Badge variant="outline" className="text-xs">
                            <ThumbsUp className="mr-1 h-3 w-3" />
                            Helpful
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {comment.id !==
                    displayedComments[displayedComments.length - 1].id && (
                    <Separator />
                  )}
                </div>
              ))}

              {comments.length > 3 && (
                <div className="pt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllComments(!showAllComments)}
                  >
                    {showAllComments
                      ? 'Show Less'
                      : `Show All ${comments.length} Comments`}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
