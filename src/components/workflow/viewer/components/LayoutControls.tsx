import { useState } from "react";
import { LayoutConfig } from "../../shared/types";
import { DEFAULT_LAYOUT_CONFIG } from "../../shared/constants";
import { Button } from "@/components/ui/button";

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
    console.log("Applying layout with config:", config);
    onApplyLayout(config);
  };

  const handleReset = () => {
    console.log("Resetting layout to default config");
    setConfig({ ...DEFAULT_LAYOUT_CONFIG });
    onApplyLayout(DEFAULT_LAYOUT_CONFIG);
  };

  // Presets for common layout configurations
  const presets = {
    compact: {
      ...DEFAULT_LAYOUT_CONFIG,
      nodeSpacing: 150,
      rankSpacing: 200,
      horizontalSpacing: 150,
      verticalSpacing: 200,
      margin: 20,
      alignRanks: true,
      centerGraph: true,
      compact: true,
    },
    spacious: {
      ...DEFAULT_LAYOUT_CONFIG,
      nodeSpacing: 400,
      rankSpacing: 450,
      horizontalSpacing: 400,
      verticalSpacing: 450,
      margin: 50,
      alignRanks: true,
      centerGraph: true,
      compact: false,
    },
    horizontal: {
      ...DEFAULT_LAYOUT_CONFIG,
      direction: "LR" as const,
      nodeSpacing: 200,
      rankSpacing: 300,
      horizontalSpacing: 300,
      verticalSpacing: 200,
      margin: 30,
      alignRanks: true,
      centerGraph: true,
    },
  };

  const applyPreset = (preset: keyof typeof presets) => {
    setConfig(presets[preset]);
    onApplyLayout(presets[preset]);
  };

  return (
    <div className="absolute bottom-4 left-4 z-50 bg-card backdrop-blur-sm rounded-lg shadow-lg border border-border">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-b-none"
        variant="default"
      >
        {isOpen ? "Hide Layout Controls" : "Layout Controls"}
      </Button>

      {isOpen && (
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Presets</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => applyPreset("compact")}
                variant="outline"
                size="sm"
              >
                Compact
              </Button>
              <Button
                onClick={() => applyPreset("spacious")}
                variant="outline"
                size="sm"
              >
                Spacious
              </Button>
              <Button
                onClick={() => applyPreset("horizontal")}
                variant="outline"
                size="sm"
              >
                Horizontal
              </Button>
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
              <Button
                onClick={() => handleChange("direction", "TB")}
                variant={config.direction === "TB" ? "default" : "outline"}
                size="sm"
              >
                Top to Bottom
              </Button>
              <Button
                onClick={() => handleChange("direction", "LR")}
                variant={config.direction === "LR" ? "default" : "outline"}
                size="sm"
              >
                Left to Right
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleApply} className="flex-1" size="sm">
              Apply
            </Button>
            <Button
              onClick={handleReset}
              className="flex-1"
              variant="outline"
              size="sm"
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
