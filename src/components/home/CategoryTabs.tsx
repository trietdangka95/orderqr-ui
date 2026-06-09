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
    <div className="sticky top-[120px] md:top-[140px] z-30 bg-gray-50/80 backdrop-blur-md py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-100/50">
      <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onTabChange(cat)}
            className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer text-sm ${
              activeTab === cat
                ? "bg-primary text-white shadow-lg shadow-primary"
                : "bg-white text-gray-500 hover:bg-primary-soft hover:text-primary border border-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
