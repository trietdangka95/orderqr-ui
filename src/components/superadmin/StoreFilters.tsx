import { Search } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface StoreFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export function StoreFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: StoreFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search stores by name or domain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          unstyled
          className="w-full pl-12 pr-4 h-12 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none"
        />
      </div>
      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        unstyled
        className="px-6 h-12 bg-gray-50 border-none rounded-2xl font-bold text-gray-600 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none cursor-pointer w-fit min-w-[160px] md:w-48 self-start md:self-auto"
      >
        <option value="all">All Status</option>
        <option value="active">Active Only</option>
        <option value="inactive">Inactive Only</option>
      </Select>
    </div>
  );
}
