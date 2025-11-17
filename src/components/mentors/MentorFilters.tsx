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

export interface MentorFilters {
  subjects: string[];
  hourlyRateRange: [number, number];
  sortBy: "recent" | "rate_low" | "rate_high" | "score";
  availableOnly: boolean;
}

interface MentorFiltersProps {
  filters: MentorFilters;
  onFiltersChange: (filters: MentorFilters) => void;
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

const MAX_RATE = 5000;

export function MentorFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
}: MentorFiltersProps) {
  const handleSubjectToggle = (subject: string) => {
    const newSubjects = filters.subjects.includes(subject)
      ? filters.subjects.filter((s) => s !== subject)
      : [...filters.subjects, subject];
    
    onFiltersChange({ ...filters, subjects: newSubjects });
  };

  const handleRateRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, hourlyRateRange: [value[0], value[1]] });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as MentorFilters["sortBy"],
    });
  };

  const handleAvailabilityToggle = (checked: boolean) => {
    onFiltersChange({ ...filters, availableOnly: checked });
  };

  const hasActiveFilters =
    filters.subjects.length > 0 ||
    filters.hourlyRateRange[0] > 100 ||
    filters.hourlyRateRange[1] < MAX_RATE ||
    filters.sortBy !== "recent" ||
    filters.availableOnly;

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
              <SelectItem value="score">Highest Score</SelectItem>
              <SelectItem value="rate_low">Rate: Low to High</SelectItem>
              <SelectItem value="rate_high">Rate: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Availability Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="available"
            checked={filters.availableOnly}
            onCheckedChange={handleAvailabilityToggle}
          />
          <Label
            htmlFor="available"
            className="text-sm font-normal cursor-pointer"
          >
            Show only available mentors
          </Label>
        </div>

        {/* Subject Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Subject</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {SUBJECTS.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={`mentor-${subject}`}
                  checked={filters.subjects.includes(subject)}
                  onCheckedChange={() => handleSubjectToggle(subject)}
                />
                <Label
                  htmlFor={`mentor-${subject}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {subject}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Rate Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Hourly Rate</Label>
          <div className="space-y-4">
            <Slider
              min={100}
              max={MAX_RATE}
              step={50}
              value={filters.hourlyRateRange}
              onValueChange={handleRateRangeChange}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>₹{filters.hourlyRateRange[0]}</span>
              <span>₹{filters.hourlyRateRange[1]}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
