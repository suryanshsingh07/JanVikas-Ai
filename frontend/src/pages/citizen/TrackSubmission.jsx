import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Calendar, Clock, CheckCircle2, 
  AlertCircle, ThumbsUp, MessageSquare, Briefcase
} from 'lucide-react';
import { submissionService } from '../../services/submissionService';
import { getCategory, getStatus } from '../../utils/helpers';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { SUBMISSION_STATUSES } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import BackButton from '../../components/common/BackButton';

const TrackSubmission = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await submissionService.getById(id);
        setSubmission(res.submission);
      } catch (error) {
        toast.error('Failed to load submission details');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  const handleVote = async () => {
    setVoting(true);
    try {
      const res = await submissionService.vote(id);
      setSubmission(prev => ({ ...prev, votes: res.votes }));
      toast.success(res.message);
    } catch (error) {
      toast.error('Failed to register vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex justify-center items-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <BackButton className="mb-6" />
        <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
        <p className="text-gray-500 mb-6">The issue you are looking for does not exist or you do not have access to it.</p>
        <Link to="/citizen/submissions" className="text-primary-500 hover:underline">Return to My Submissions</Link>
      </div>
    );
  }

  const category = getCategory(submission.category);
  const currentStatus = getStatus(submission.status);
  
  // Find current step index
  const currentStepIndex = SUBMISSION_STATUSES.findIndex(s => s.id === submission.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Back Navigation */}
      <div>
        <Link to="/citizen/submissions" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-foreground mb-4 transition-colors">
          <ArrowLeft size={16} />
          Back to Submissions
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${currentStatus.bg} ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} /> {formatRelativeTime(submission.createdAt)}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">{submission.title}</h1>
          </div>
          
          <button 
            onClick={handleVote}
            disabled={voting}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg hover:bg-surfaceHover transition-colors shrink-0"
          >
            <ThumbsUp size={18} className={voting ? 'animate-bounce text-primary-500' : ''} />
            <span className="font-medium">{submission.votes} Upvotes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Description, Media, AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Insights Banner */}
          {submission.aiAnalysis && (
            <div className="bg-gradient-to-r from-primary-50 to-info/10 dark:from-primary-900/20 dark:to-info/10 border border-primary-100 dark:border-primary-800 rounded-xl p-4 flex gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 className="text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1 text-primary-900 dark:text-primary-100">AI Initial Assessment Complete</h3>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Priority Score: <span className="font-bold">{submission.aiAnalysis.priorityScore}/10</span>. 
                  Extracted Keywords: {submission.aiAnalysis.keywords?.slice(0, 3).join(', ')}.
                </p>
                {submission.aiAnalysis.isDuplicate && (
                  <p className="text-sm text-danger mt-2 font-medium flex items-center gap-1">
                    <AlertCircle size={14} /> Flagged as potential duplicate issue.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 border-b border-border pb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {submission.description}
            </p>
            
            <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Location
                </p>
                <p className="text-sm font-medium">
                  {submission.location?.district || 'Unknown'}, {submission.location?.state || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Briefcase size={12} /> Category
                </p>
                <p className="text-sm font-medium">{category.label}</p>
              </div>
            </div>
          </div>

          {/* Media Attachments */}
          {submission.media?.images?.length > 0 && (
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-3 border-b border-border pb-2">Attached Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {submission.media.images.map((img, idx) => (
                  <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-lg overflow-hidden border border-border group block">
                    <img src={img} alt={`Attachment ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Tracking Timeline */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-5 border-b border-border pb-2">Progress Tracker</h3>
            
            <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-border">
              {SUBMISSION_STATUSES.map((statusObj, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                
                // Find history entry for this status if available
                const historyEntry = submission.statusHistory?.find(h => h.status === statusObj.id);
                
                return (
                  <div key={statusObj.id} className="relative">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[30px] w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center
                      ${isCompleted ? 'border-primary-500' : 'border-border'}
                      ${isCurrent ? 'ring-4 ring-primary-500/20' : ''}
                    `}>
                      {isCompleted && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                    </div>
                    
                    {/* Content */}
                    <div>
                      <h4 className={`text-sm font-semibold ${isCompleted ? 'text-foreground' : 'text-gray-400'}`}>
                        {statusObj.label}
                      </h4>
                      {isCompleted && historyEntry && (
                        <div className="mt-1">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(historyEntry.date || submission.createdAt)}
                          </p>
                          {historyEntry.note && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 bg-surface p-2 rounded border border-border">
                              "{historyEntry.note}"
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Show creation date for 'pending' state automatically */}
                      {statusObj.id === 'pending' && !historyEntry && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(submission.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Related Project Link */}
          {submission.relatedProject && (
            <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800 p-5 rounded-xl">
              <h3 className="text-sm font-bold text-primary-900 dark:text-primary-100 mb-2 flex items-center gap-2">
                <Briefcase size={16} /> Attached to Project
              </h3>
              <p className="text-xs text-primary-700 dark:text-primary-300 mb-3">
                Good news! This issue has been included in a larger constituency development project.
              </p>
              <div className="bg-white dark:bg-black/20 p-3 rounded border border-primary-100 dark:border-primary-800">
                <p className="text-sm font-semibold truncate">{submission.relatedProject.title}</p>
                <p className="text-xs text-gray-500 mt-1">Status: {submission.relatedProject.status}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackSubmission;
