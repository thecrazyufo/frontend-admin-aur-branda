import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function SearchBar({
  placeholder = "Search products, tools, guides...",
  className = "",
  size = "md",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const sizeClasses = {
    sm: "h-10 text-sm",
    md: "h-12 text-sm",
    lg: "h-14 text-base",
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`} role="search">
      <Search
        size={size === "lg" ? 20 : 17}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className={`w-full ${sizeClasses[size]} pl-11 pr-28 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm`}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary text-sm py-1.5 px-4"
      >
        Search
      </button>
    </form>
  );
}
