"use client"

import { Button } from "@/components/ui/button"
import { InertiaFormProps } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"

interface FormHeaderProps {
  title: string
  description?: string
  onCancel: () => void
  onSave: (e: React.FormEvent) => void
  saveLabel?: string
  showReturn?: boolean
  form: InertiaFormProps<any>
}

export default function FormHeader({
  title,
  description,
  onCancel,
  onSave,
  saveLabel = "حفظ",
  showReturn = true,
  form,
}: FormHeaderProps) {
  return (
    <div className="border-b">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          {showReturn && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        <Button onClick={onSave} disabled={form.processing || form.hasErrors} type="submit" variant={"default"}>
          {saveLabel}
        </Button>
      </div>
    </div>
  )
}
