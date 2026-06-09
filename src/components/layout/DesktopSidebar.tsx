"use client";

import { useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function DesktopSidebar() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  return (
    <aside className="hidden md:block w-64 flex-shrink-0 mr-8 sticky top-6 h-fit">
      <h3 className="text-gray-400 text-sm mb-4">Tìm kiếm món...</h3>
      <div className="flex flex-col space-y-1">
        {categories.map((cat, index) => (
          <button
            key={cat.id}
            className={`flex items-center space-x-3 py-3 px-4 rounded-xl text-left transition-colors ${
              index === 0 ? "bg-primary text-white shadow-md shadow-primary" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {/* Giả lập icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${index === 0 ? "bg-white/20" : "bg-gray-100"}`}>
              🍵
            </div>
            <span className="font-medium text-sm">{cat.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
