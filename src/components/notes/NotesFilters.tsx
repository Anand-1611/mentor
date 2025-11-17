import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export interface NotesFilters {
  subjects: string[];
  priceRange: [number, number];
  sortBy: "recent" | "price_low" | "price_high" | "popular";
}

interface NotesFiltersProps {
  filters: NotesFilters;
  onFiltersChange: (filters: NotesFilters) => void;
  onClearFilters: () => void;
}

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "Biology",
  "English",
  "History",
  "Economics",
  "Business Studies",
  "Accountancy",
];

const MAX_PRICE = 5000;

export function NotesFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
}: NotesFiltersProps) {
  const handleSubjectToggle = (subject: string) => {
    const newSubjects = filters.subjects.includes(subject)
      ? filters.subjects.filter((s) => s !== subject)
      : [...filters.subjects, subject];
    
    onFiltersChange({ ...filters, subjects: newSubjects });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as NotesFilters["sortBy"],
    });
  };

  const hasActiveFilters =
    filters.subjects.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < MAX_PRICE ||
    filters.sortBy !== "recent";

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sort By */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subject Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Subject</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {SUBJECTS.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={subject}
                  checked={filters.subjects.includes(subject)}
                  onCheckedChange={() => handleSubjectToggle(subject)}
                />
                <Label
                  htmlFor={subject}
                  className="text-sm font-normal cursor-pointer"
                >
                  {subject}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="space-y-4">
            <Slider
              min={0}
              max={MAX_PRICE}
              step={10}
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>₹{filters.priceRange[0]}</span>
              <span>₹{filters.priceRange[1]}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
