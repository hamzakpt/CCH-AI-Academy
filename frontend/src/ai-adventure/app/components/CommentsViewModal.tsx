import { X, Star, MessageSquare } from 'lucide-react';
import { Button } from '@ai-adventure/app/components/ui/button';

interface Comment {
  rating: number;
  comment: string;
  timestamp?: Date;
  createdAt?: string;
}

interface CommentsViewModalProps {
  scenarioId: string;
  scenarioTitle?: string;
  comments: Comment[];
  averageRating: number;
  onClose: () => void;
  onAddRating: () => void;
}

export function CommentsViewModal({ scenarioId, scenarioTitle = 'Scenario', comments, averageRating, onClose, onAddRating }: CommentsViewModalProps) {

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-[#E41E2B] text-[#E41E2B]' : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ratings & Comments</h3>
          <p className="text-sm text-gray-600 mb-3">{scenarioTitle}</p>
          
          {/* Average Rating Display */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </span>
              <div>
                {renderStars(Math.round(averageRating))}
                <p className="text-xs text-gray-500 mt-0.5">{comments.length} rating{comments.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No comments yet</p>
              <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    {renderStars(item.rating)}
                    <span className="text-xs text-gray-500">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : item.timestamp
                        ? new Date(item.timestamp).toLocaleDateString()
                        : 'Recently'}
                    </span>
                  </div>
                  {item.comment && (
                    <p className="text-sm text-gray-700 leading-relaxed">{item.comment}</p>
                  )}
                  {!item.comment && (
                    <p className="text-sm text-gray-400 italic">No comment provided</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <Button
            onClick={() => {
              onClose();
              onAddRating();
            }}
            className="w-full bg-[#E41E2B] hover:bg-[#DC0008] text-white"
          >
            Add Your Rating
          </Button>
        </div>
      </div>
    </div>
  );
}
