import { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { Button } from '@ai-adventure/app/components/ui/button';
import { scenarios } from '@ai-adventure/app/data/scenarios-30';

interface RatingModalProps {
  scenarioId: string;
  existingComments: { rating: number; comment: string }[];
  onClose: () => void;
  onSubmit: (scenarioId: string, rating: number, comment: string) => void;
}

export function RatingModal({ scenarioId, existingComments, onClose, onSubmit }: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const scenario = scenarios.find(s => s.id === scenarioId);
  const scenarioTitle = scenario?.title || 'Scenario';

  const handleSubmit = () => {
    if (selectedRating > 0) {
      onSubmit(scenarioId, selectedRating, comment);
      onClose();
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'fill-[#E41E2B] text-[#E41E2B]' : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Rate This Scenario</h3>
          <p className="text-sm text-gray-600">{scenarioTitle}</p>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Your Rating</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 transition-colors ${
                    rating <= (hoveredRating || selectedRating)
                      ? 'fill-[#E41E2B] text-[#E41E2B]'
                      : 'fill-none text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {selectedRating > 0 && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {selectedRating === 1 && 'Needs Improvement'}
              {selectedRating === 2 && 'Fair'}
              {selectedRating === 3 && 'Good'}
              {selectedRating === 4 && 'Very Good'}
              {selectedRating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Comment Section */}
        <div className="mb-6">
          <label htmlFor="comment" className="text-sm font-semibold text-gray-700 mb-2 block">
            Comments (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this scenario..."
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#E41E2B] text-gray-900 placeholder:text-gray-400 resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedRating === 0}
            className={`flex-1 ${
              selectedRating === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#E41E2B] hover:bg-[#DC0008] text-white'
            }`}
          >
            Submit Rating
          </Button>
        </div>

        {/* Previous Comments Section */}
        {existingComments.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Previous Comments ({existingComments.length})
              </h4>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {existingComments.slice(0, 5).map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(item.rating)}
                  </div>
                  {item.comment && (
                    <p className="text-xs text-gray-700 leading-relaxed">{item.comment}</p>
                  )}
                  {!item.comment && (
                    <p className="text-xs text-gray-400 italic">No comment provided</p>
                  )}
                </div>
              ))}
              {existingComments.length > 5 && (
                <p className="text-xs text-gray-500 text-center italic">
                  And {existingComments.length - 5} more...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}