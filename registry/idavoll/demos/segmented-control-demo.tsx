import { BarChart3, LineChart, Monitor, Moon, Sun, Table2 } from "lucide-react";
import { useState } from "react";
import { SegmentedControl } from "@/components/idavoll/segmented-control";

export default function SegmentedControlDemo() {
  const [range, setRange] = useState("30d");

  return (
    <div className="flex flex-col items-start gap-6">
      <SegmentedControl
        label="Appearance"
        options={[
          { value: "light", label: "Light", icon: <Sun /> },
          { value: "dark", label: "Dark", icon: <Moon /> },
          { value: "system", label: "System", icon: <Monitor /> },
        ]}
        defaultValue="system"
      />

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label="Chart range"
          size="sm"
          options={[
            { value: "7d", label: "7 days" },
            { value: "30d", label: "30 days" },
            { value: "90d", label: "90 days" },
          ]}
          value={range}
          onValueChange={setRange}
        />
        <span className="text-muted-foreground text-sm">Showing the last {range.replace("d", " days")}</span>
      </div>

      <SegmentedControl
        label="View"
        size="sm"
        options={[
          { value: "line", label: "", icon: <LineChart />, ariaLabel: "Line chart" },
          { value: "bar", label: "", icon: <BarChart3 />, ariaLabel: "Bar chart" },
          { value: "table", label: "", icon: <Table2 />, ariaLabel: "Table" },
        ]}
      />

      <SegmentedControl
        label="Goal type"
        fullWidth
        options={[
          { value: "followers", label: "Followers" },
          { value: "views", label: "Views" },
          { value: "posts", label: "Posts" },
          { value: "revenue", label: "Revenue", disabled: true },
        ]}
      />
    </div>
  );
}
