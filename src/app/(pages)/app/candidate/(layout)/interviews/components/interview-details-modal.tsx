// import React from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import {
//   Calendar,
//   Clock,
//   Building,
//   Briefcase,
//   Video,
//   Users,
//   ExternalLink,
//   Globe,
// } from 'lucide-react';
// import { format } from 'date-fns';
// import {
//   ICandidateInterviewDetailResponse,
//   InterviewInvitationStatusEnum,
//   InterviewInvitationTypeEnum,
// } from '@teamcastai/commons';

// interface InterviewDetailsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   interview: ICandidateInterviewDetailResponse | null;
//   onJoinInterview?: (interview: ICandidateInterviewDetailResponse) => void;
// }

// const getStatusColor = (status: InterviewInvitationStatusEnum) => {
//   switch (status) {
//     case InterviewInvitationStatusEnum.PENDING:
//       return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
//     case InterviewInvitationStatusEnum.ACCEPTED:
//       return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
//     case InterviewInvitationStatusEnum.EXPIRED:
//       return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
//     case InterviewInvitationStatusEnum.CANCELLED:
//       return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
//     default:
//       return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
//   }
// };

// export default function InterviewDetailsModal({
//   isOpen,
//   onClose,
//   interview,
//   onJoinInterview,
// }: InterviewDetailsModalProps) {
//   if (!interview) return null;

//   const formatDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), 'PPP p');
//     } catch {
//       return 'Invalid date';
//     }
//   };

//   const formatSalary = (min?: number, max?: number, currency?: string) => {
//     if (!min && !max) return 'Not disclosed';
//     const curr = currency || '$';
//     if (min && max) {
//       return `${curr}${min.toLocaleString()} - ${curr}${max.toLocaleString()}`;
//     }
//     if (min) return `${curr}${min.toLocaleString()}+`;
//     if (max) return `Up to ${curr}${max.toLocaleString()}`;
//     return 'Not disclosed';
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
//         <DialogHeader className="border-b border-gray-200 pb-3 dark:border-gray-700">
//           <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
//             <Calendar className="h-5 w-5" />
//             Interview Details
//           </DialogTitle>
//           <DialogDescription>
//             Complete information about your scheduled interview
//           </DialogDescription>
//         </DialogHeader>

//         <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
//           <div className="space-y-6">
//             {/* Interview Header */}
//             <div className="flex items-start gap-4 rounded-lg border bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
//               <img
//                 src={interview.company?.logo || '/placeholder-logo.png'}
//                 alt={`${interview.company?.name || 'Company'} logo`}
//                 className="h-16 w-16 rounded-lg border-2 border-white object-cover dark:border-gray-800"
//               />
//               <div className="flex-1">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                       {interview.jobPosting?.title || 'Interview Position'}
//                     </h3>
//                     <p className="text-lg font-medium text-[#6e55cf] dark:text-[#7c6fd7]">
//                       {interview.company?.name || 'Company Name'}
//                     </p>
//                     <div className="mt-1 flex items-center gap-2">
//                       <Building className="h-4 w-4 text-gray-500" />
//                       <span className="text-sm text-gray-600 dark:text-gray-400">
//                         {interview.company?.industry || 'Industry'} •{' '}
//                         {interview.company?.size || 'Company Size'}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <Badge className={getStatusColor(interview.status)}>
//                       {interview.status.replace('_', ' ')}
//                     </Badge>
//                     <Badge
//                       variant={
//                         interview.type === InterviewInvitationTypeEnum.AI
//                           ? 'default'
//                           : 'secondary'
//                       }
//                     >
//                       {interview.type === InterviewInvitationTypeEnum.AI
//                         ? 'AI Assessment'
//                         : 'Live Interview'}
//                     </Badge>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="mt-4 flex gap-2">
//                   {interview.status ===
//                     InterviewInvitationStatusEnum.ACCEPTED &&
//                     onJoinInterview && (
//                       <Button
//                         onClick={() => onJoinInterview(interview)}
//                         className="flex items-center gap-2"
//                       >
//                         {interview.type === InterviewInvitationTypeEnum.AI ? (
//                           <>
//                             <Clock className="h-4 w-4" />
//                             Start Assessment
//                           </>
//                         ) : (
//                           <>
//                             <Video className="h-4 w-4" />
//                             Join Interview
//                           </>
//                         )}
//                         <ExternalLink className="h-4 w-4" />
//                       </Button>
//                     )}
//                 </div>
//               </div>
//             </div>

//             {/* Interview Information */}
//             <div className="grid gap-6 md:grid-cols-2">
//               <div className="space-y-4">
//                 <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
//                   <Calendar className="h-5 w-5" />
//                   Interview Details
//                 </h4>

//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Scheduled Date & Time
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {interview.scheduledDate
//                         ? formatDate(interview.scheduledDate)
//                         : 'Not scheduled'}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Expires At
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {formatDate(interview.expiresAt)}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Invited By
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {interview.inviter?.name || 'Not specified'}
//                     </p>
//                     <p className="text-xs text-gray-500 dark:text-gray-500">
//                       {interview.inviter?.email}
//                     </p>
//                   </div>

//                   {interview.message && (
//                     <div>
//                       <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Message
//                       </p>
//                       <p className="rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
//                         {interview.message}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
//                   <Briefcase className="h-5 w-5" />
//                   Job Information
//                 </h4>

//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Job Type
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {interview.jobPosting?.jobType || 'Not specified'}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Commitment
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {interview.jobPosting?.jobCommitment || 'Not specified'}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Experience Required
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {interview.jobPosting?.totalExperience
//                         ? `${interview.jobPosting.totalExperience} years`
//                         : 'Not specified'}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Remote Work
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {interview.jobPosting?.isRemote ? 'Yes' : 'No'}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Salary Range
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {formatSalary(
//                         interview.jobPosting?.minSalary,
//                         interview.jobPosting?.maxSalary,
//                         interview.jobPosting?.salaryCurrency
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Job Description */}
//             {interview.jobPosting?.description && (
//               <div>
//                 <h4 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
//                   Job Description
//                 </h4>
//                 <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
//                   <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
//                     {interview.jobPosting.description}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Skills */}
//             {(interview.jobPosting?.requiredSkills?.length ||
//               interview.jobPosting?.preferredSkills?.length) && (
//               <div>
//                 <h4 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
//                   Skills
//                 </h4>
//                 <div className="space-y-3">
//                   {interview.jobPosting.requiredSkills?.length > 0 && (
//                     <div>
//                       <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Required Skills
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {interview.jobPosting.requiredSkills.map(
//                           (skill, index) => (
//                             <Badge
//                               key={index}
//                               variant="default"
//                               className="text-xs"
//                             >
//                               {skill}
//                             </Badge>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {interview.jobPosting.preferredSkills?.length > 0 && (
//                     <div>
//                       <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
//                         Preferred Skills
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {interview.jobPosting.preferredSkills.map(
//                           (skill, index) => (
//                             <Badge
//                               key={index}
//                               variant="secondary"
//                               className="text-xs"
//                             >
//                               {skill}
//                             </Badge>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Company Information */}
//             <div>
//               <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
//                 <Building className="h-5 w-5" />
//                 Company Information
//               </h4>
//               <div className="grid gap-6 md:grid-cols-2">
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       About the Company
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {interview.company?.description ||
//                         'No company description available'}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Website
//                     </p>
//                     {interview.company?.website ? (
//                       <a
//                         href={interview.company.website}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
//                       >
//                         <Globe className="h-3 w-3" />
//                         {interview.company.website}
//                       </a>
//                     ) : (
//                       <p className="text-sm text-gray-600 dark:text-gray-400">
//                         Website not available
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Founded
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {interview.company?.foundedYear || 'Not specified'}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Company Stage
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {interview.company?.stage || 'Not specified'}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Location
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {[
//                         interview.company?.city,
//                         interview.company?.state,
//                         interview.company?.country,
//                       ]
//                         .filter(Boolean)
//                         .join(', ') || 'Location not specified'}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Contact
//                     </p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {interview.company?.contactEmail || 'Not available'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Company Culture */}
//             {interview.company?.culture &&
//               (interview.company.culture.mission ||
//                 interview.company.culture.vision ||
//                 interview.company.culture.values?.length) && (
//                 <div>
//                   <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
//                     <Users className="h-5 w-5" />
//                     Company Culture
//                   </h4>
//                   <div className="space-y-4">
//                     {interview.company.culture.mission && (
//                       <div>
//                         <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                           Mission
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           {interview.company.culture.mission}
//                         </p>
//                       </div>
//                     )}

//                     {interview.company.culture.vision && (
//                       <div>
//                         <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                           Vision
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           {interview.company.culture.vision}
//                         </p>
//                       </div>
//                     )}

//                     {interview.company.culture.values?.length > 0 && (
//                       <div>
//                         <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
//                           Values
//                         </p>
//                         <div className="flex flex-wrap gap-2">
//                           {interview.company.culture.values.map(
//                             (value, index) => (
//                               <Badge
//                                 key={index}
//                                 variant="outline"
//                                 className="text-xs"
//                               >
//                                 {value}
//                               </Badge>
//                             )
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//             {/* Assessment Results */}
//             {interview.assessment && (
//               <div>
//                 <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
//                   <Clock className="h-5 w-5" />
//                   Assessment Information
//                 </h4>
//                 <div className="grid gap-6 md:grid-cols-2">
//                   <div className="space-y-3">
//                     {interview.assessment.score !== undefined && (
//                       <div>
//                         <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                           Score
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           {interview.assessment.score}%
//                         </p>
//                       </div>
//                     )}

//                     {interview.assessment.status && (
//                       <div>
//                         <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                           Status
//                         </p>
//                         <Badge variant="outline">
//                           {interview.assessment.status}
//                         </Badge>
//                       </div>
//                     )}

//                     {interview.assessment.duration && (
//                       <div>
//                         <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                           Duration
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           {interview.assessment.duration} minutes
//                         </p>
//                       </div>
//                     )}
//                   </div>

//                   <div className="space-y-3">
//                     {interview.assessment.jobFitScore && (
//                       <div>
//                         <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                           Job Fit Score
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           {interview.assessment.jobFitScore}%
//                         </p>
//                       </div>
//                     )}

//                     {interview.assessment.recommendation && (
//                       <div>
//                         <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                           Recommendation
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           {interview.assessment.recommendation}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {interview.assessment.overallFeedback && (
//                   <div className="mt-4">
//                     <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
//                       Overall Feedback
//                     </p>
//                     <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
//                       <p className="text-sm text-gray-700 dark:text-gray-300">
//                         {interview.assessment.overallFeedback}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </ScrollArea>
//       </DialogContent>
//     </Dialog>
//   );
// }
