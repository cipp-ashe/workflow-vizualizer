import { useState } from "react";
import { LayoutConfig } from "../../shared/types";
import { DEFAULT_LAYOUT_CONFIG } from "../../shared/constants";

interface LayoutControlsProps {
  onApplyLayout: (config: LayoutConfig) => void;
}

/**
 * Component for adjusting layout parameters
 */
export function LayoutControls({ onApplyLayout }: LayoutControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<LayoutConfig>({
    ...DEFAULT_LAYOUT_CONFIG,
  });

  const handleChange = (
    key: keyof LayoutConfig,
    value: number | string | boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onApplyLayout(config);
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_LAYOUT_CONFIG });
    onApplyLayout(DEFAULT_LAYOUT_CONFIG);
  };

  // Presets for common layout configurations
  const presets = {
    compact: {
      ...DEFAULT_LAYOUT_CONFIG,
      nodeSpacing: 150,
      rankSpacing: 200,
      compact: true,
    },
    spacious: {
      ...DEFAULT_LAYOUT_CONFIG,
      nodeSpacing: 300,
      rankSpacing: 350,
      compact: false,
    },
    horizontal: {
      ...DEFAULT_LAYOUT_CONFIG,
      direction: "LR" as const,
      nodeSpacing: 200,
      rankSpacing: 300,
    },
  };

  const applyPreset = (preset: keyof typeof presets) => {
    setConfig(presets[preset]);
    onApplyLayout(presets[preset]);
  };

  return (
    <div className="absolute bottom-4 left-4 z-50 bg-[hsl(var(--card))]/90 backdrop-blur-sm rounded-lg shadow-lg border border-[hsl(var(--border))]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:bg-[hsl(var(--primary))/90] text-sm font-medium transition-colors w-full"
      >
        {isOpen ? "Hide Layout Controls" : "Layout Controls"}
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Presets</h3>
            <div className="flex gap-2">
              <button
                onClick={() => applyPreset("compact")}
                className="px-2 py-1 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-md hover:bg-[hsl(var(--muted))/80] text-xs"
              >
                Compact
              </button>
              <button
                onClick={() => applyPreset("spacious")}
                className="px-2 py-1 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-md hover:bg-[hsl(var(--muted))/80] text-xs"
              >
                Spacious
              </button>
              <button
                onClick={() => applyPreset("horizontal")}
                className="px-2 py-1 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-md hover:bg-[hsl(var(--muted))/80] text-xs"
              >
                Horizontal
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Spacing</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs">Node Spacing</label>
                <input
                  type="range"
                  min="50"
                  max="600"
                  value={config.nodeSpacing}
                  onChange={(e) =>
                    handleChange("nodeSpacing", parseInt(e.target.value))
                  }
                  className="w-full"
                />
                <div className="text-xs text-right">{config.nodeSpacing}px</div>
              </div>
              <div>
                <label className="text-xs">Rank Spacing</label>
                <input
                  type="range"
                  min="50"
                  max="600"
                  value={config.rankSpacing}
                  onChange={(e) =>
                    handleChange("rankSpacing", parseInt(e.target.value))
                  }
                  className="w-full"
                />
                <div className="text-xs text-right">{config.rankSpacing}px</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Direction</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleChange("direction", "TB")}
                className={
                  config.direction === "TB"
                    ? "px-2 py-1 rounded-md text-xs bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "px-2 py-1 rounded-md text-xs bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                }
              >
                Top to Bottom
              </button>
              <button
                onClick={() => handleChange("direction", "LR")}
                className={
                  config.direction === "LR"
                    ? "px-2 py-1 rounded-md text-xs bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "px-2 py-1 rounded-md text-xs bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                }
              >
                Left to Right
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleApply}
              className="flex-1 px-2 py-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary))/90] text-xs font-medium"
            >
              Apply
            </button>
            <button
              onClick={handleReset}
              className="flex-1 px-2 py-1 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded-md hover:bg-[hsl(var(--muted))/80] text-xs"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
