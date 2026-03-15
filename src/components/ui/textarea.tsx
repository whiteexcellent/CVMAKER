import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      aria-label={props['aria-label'] || props.id || props.name || "Text area"}
      className={cn(
        "border-input placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:border-black/20 dark:hover:border-white/20 outline-none focus-visible:border-black/30 dark:focus-visible:border-white/30 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:ring-[4px] focus-visible:shadow-md disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
