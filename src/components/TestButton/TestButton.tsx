import React from "react";
import { Button } from "@/components/ui/button";
import { BUTTON_VARIANTS, BUTTON_SIZES, ICON_PATH, UI_TEXT } from "./constants";

/**
 * TestButton Component
 *
 * A component that demonstrates different button variants and sizes
 * from the UI component library. This is useful for testing and
 * showcasing the button styles available in the application.
 *
 * @example
 * ```tsx
 * <TestButton />
 * ```
 */
export function TestButton() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{UI_TEXT.TITLE}</h1>

      <div className="space-y-2">
        <h2 className="text-xl">{UI_TEXT.VARIANTS_TITLE}</h2>
        <div className="flex flex-wrap gap-2">
          {BUTTON_VARIANTS.map((buttonVariant) => (
            <Button key={buttonVariant.name} variant={buttonVariant.variant}>
              {buttonVariant.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl">{UI_TEXT.SIZES_TITLE}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {BUTTON_SIZES.map((buttonSize) => (
            <Button key={buttonSize.name} size={buttonSize.size}>
              {buttonSize.name}
            </Button>
          ))}

          {/* Icon button example */}
          <Button size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={ICON_PATH} />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
