import { SourceBadge } from "@/components/idavoll/source-badge";
import { TooltipProvider } from "@/components/ui/tooltip";

const rows = [
  { what: "YouTube AdSense", amount: "$184.20", source: "verified" as const, platform: "youtube" as const },
  { what: "Lumen Tools sponsorship", amount: "$600.00", source: "self-reported" as const },
  { what: "TikTok Creator Rewards", amount: "$42.75", source: "verified" as const, platform: "tiktok" as const },
];

export default function SourceBadgeDemo() {
  return (
    // Put one TooltipProvider near the root of your app.
    <TooltipProvider>
      <table className="w-full max-w-xl text-sm">
        <caption className="sr-only">Income this month</caption>
        <thead>
          <tr className="border-b text-left text-foreground/70">
            <th scope="col" className="py-2 font-medium">
              Income
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Amount
            </th>
            <th scope="col" className="py-2 pl-4 font-medium">
              Source
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.what} className="border-b last:border-0">
              <td className="py-2">{r.what}</td>
              <td className="py-2 text-right tabular-nums">{r.amount}</td>
              <td className="py-2 pl-4">
                <SourceBadge source={r.source} platform={r.platform} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TooltipProvider>
  );
}
