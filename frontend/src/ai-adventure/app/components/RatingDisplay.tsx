import { Star } from 'lucide-react';

interface RatingDisplayProps {
  averageRating: number;
  totalRatings: number;
  onRate: () => void;
  onViewComments: () => void;
}

export function RatingDisplay({ averageRating, totalRatings, onRate, onViewComments }: RatingDisplayProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {/* Star Rating - Click to Rate */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRate();
        }}
        className="group transition-transform hover:scale-105"
        title="Click to rate this scenario"
      >
        <div className="relative">
          <Star className="h-7 w-7 fill-[#FFD700] text-[#FFD700] group-hover:fill-[#E41E2B] group-hover:text-[#E41E2B] transition-colors" />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-900 group-hover:text-white transition-colors">
            {averageRating > 0 ? averageRating.toFixed(1) : '?'}
          </span>
        </div>
      </button>
      
      {/* Rating Count - Click to View Comments */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewComments();
        }}
        className="text-[10px] text-gray-600 hover:text-[#E41E2B] hover:underline transition-colors"
        title="Click to view all comments"
      >
        ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
      </button>
    </div>
  );
}