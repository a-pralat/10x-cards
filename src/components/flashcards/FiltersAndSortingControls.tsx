import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Source } from "../../types";

interface Filters {
  source?: Source;
  generationId?: number;
}

interface Sorting {
  sortField: "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
}

interface FiltersAndSortingControlsProps {
  currentFilters: Filters;
  currentSorting: Sorting;
  onFilterChange: (filters: Filters) => void;
  onSortChange: (sorting: Sorting) => void;
}

export function FiltersAndSortingControls({
  currentFilters,
  currentSorting,
  onFilterChange,
  onSortChange,
}: FiltersAndSortingControlsProps) {
  const handleSourceChange = (value: Source | "all") => {
    onFilterChange({
      ...currentFilters,
      source: value === "all" ? undefined : (value as Source),
    });
  };

  const handleGenerationIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ? parseInt(event.target.value, 10) : undefined;
    onFilterChange({ ...currentFilters, generationId: value });
  };

  const handleSortFieldChange = (value: "created_at" | "updated_at") => {
    onSortChange({ ...currentSorting, sortField: value });
  };

  const handleSortOrderChange = (value: "asc" | "desc") => {
    onSortChange({ ...currentSorting, sortOrder: value });
  };

  return (
    <div className="flex gap-4 items-center">
      <div className="flex flex-col gap-2">
        <Label id="source-label">Source</Label>
        <Select
          value={currentFilters.source || "all"}
          onValueChange={handleSourceChange}
          aria-labelledby="source-label"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="ai-gen">AI Generated</SelectItem>
            <SelectItem value="ai-gen-edited">AI Generated (Edited)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="generation-id">Generation ID</Label>
        <Input
          id="generation-id"
          type="number"
          value={currentFilters.generationId || ""}
          onChange={handleGenerationIdChange}
          className="w-[120px]"
          placeholder="ID"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label id="sort-field-label">Sort by</Label>
        <Select
          value={currentSorting.sortField}
          onValueChange={handleSortFieldChange}
          aria-labelledby="sort-field-label"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Created Date</SelectItem>
            <SelectItem value="updated_at">Updated Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label id="sort-order-label">Order</Label>
        <Select
          value={currentSorting.sortOrder}
          onValueChange={handleSortOrderChange}
          aria-labelledby="sort-order-label"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
