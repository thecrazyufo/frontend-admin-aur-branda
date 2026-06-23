import { Star, Quote } from "lucide-react";

interface TestimonialCardProps {
  author: string;
  role?: string;
  company?: string;
  rating: number;
  content: string;
  date?: string;
}

export default function TestimonialCard({
  author,
  role,
  company,
  rating,
  content,
  date,
}: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 card-hover">
      {/* Stars */}
      <div className="flex gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={15}
            fill={i < rating ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </div>

      {/* Quote */}
      <div className="relative">
        <Quote size={28} className="text-blue-100 absolute -top-1 -left-1" />
        <p className="text-sm text-gray-600 leading-relaxed pl-6 italic">&ldquo;{content}&rdquo;</p>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{author}</p>
          {(role || company) && (
            <p className="text-xs text-gray-400">
              {role}{role && company && " · "}{company}
            </p>
          )}
          {date && <p className="text-xs text-gray-300">{date}</p>}
        </div>
      </div>
    </div>
  );
}
