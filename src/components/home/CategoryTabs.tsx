"use client";

interface CategoryTabsProps {
  categories: string[];
  activeTab: string;
  onTabChange: (categoryName: string) => void;
}

export default function CategoryTabs({
  categories,
  activeTab,
  onTabChange,
}: CategoryTabsProps) {
  return (
    <div className="sticky top-38 z-30 bg-gray-50/80 backdrop-blur-md py-2">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onTabChange(cat)}
            className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer text-sm ${
              activeTab === cat
                ? "bg-primary text-white shadow-orange-200"
                : "bg-white text-gray-500 hover:bg-orange-50 hover:text-primary border border-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
