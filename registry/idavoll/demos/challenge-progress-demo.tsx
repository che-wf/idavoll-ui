import { ChallengeProgress } from "@/components/idavoll/challenge-progress";

export default function ChallengeProgressDemo() {
  return (
    <ChallengeProgress
      title="90-day video challenge"
      day={37}
      goal={{ label: "Followers", start: 2000, current: 6100, target: 10000 }}
      className="max-w-md"
    />
  );
}
