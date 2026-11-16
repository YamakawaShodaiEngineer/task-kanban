"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TaskTitleFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** 検証エラーの文言。無ければ null */
  error: string | null;
  placeholder?: string;
};

/** タイトルの入力欄。エラーは入力欄の直下に表示し、aria属性で入力欄と紐付ける */
export default function TaskTitleField({
  value,
  onChange,
  error,
  placeholder,
}: TaskTitleFieldProps) {
  const inputId = useId();
  const errorId = useId();

  return (
    <div className="grid gap-2">
      <Label htmlFor={inputId}>タイトル</Label>
      <Input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
