import { legendItems } from "../constants/legendItems";

/**
 * Component for displaying the workflow legend
 */
export function WorkflowLegend() {
  return (
    <div className="absolute top-4 left-4 z-50 bg-[hsl(var(--card))]/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-[hsl(var(--border))] max-w-[250px]">
      <div className="flex flex-wrap gap-2">
        {legendItems.map((item, index) =>
          item.type === "transition" ? (
            <div
              key={index}
              title={item.title}
              className="flex items-center gap-1 bg-[hsl(var(--muted))]/50 px-2 py-1 rounded-md"
            >
              <div
                className={`w-3 h-0.5 bg-[hsl(var(--workflow-${
                  item.color.split("-")[0]
                }))]`}
              />
              <span className="text-xs text-foreground">{item.label}</span>
            </div>
          ) : (
            <div
              key={index}
              title={item.title}
              className="flex items-center gap-1 bg-[hsl(var(--muted))]/50 px-2 py-1 rounded-md"
            >
              {item.icon && (
                <item.icon
                  className={`w-3 h-3 text-[hsl(var(--workflow-${
                    item.color.split("-")[0]
                  }))]`}
                />
              )}
              <span className="text-xs text-foreground">{item.label}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
