import { useState } from "react";
import { MilestoneEditor, type MilestoneEntry } from "@/components/idavoll/milestone-editor";

export default function MilestoneEditorDemo() {
  const [milestones, setMilestones] = useState<MilestoneEntry[]>([{ value: 5000, label: "First big one" }]);
  return (
    <MilestoneEditor start={2000} goal={12000} metricLabel="followers" value={milestones} onChange={setMilestones} />
  );
}
