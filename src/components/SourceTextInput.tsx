import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import type { ChangeEvent } from "react";

interface SourceTextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SourceTextInput({ value, onChange, disabled }: SourceTextInputProps) {
  const characterCount = value.length;
  const isValid = characterCount >= 1000 && characterCount <= 10000;
  const countColor = isValid ? "text-green-600" : "text-red-600";

  return (
    <Card>
      <CardContent className="pt-6">
        <Textarea
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter your source text here (1000-10000 characters)"
          className="min-h-[200px] max-h-[200px] resize-y"
        />
        <div className={`mt-2 text-sm ${countColor}`}>{characterCount} / 10000 characters</div>
      </CardContent>
    </Card>
  );
}
