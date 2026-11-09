import { CopyField } from "@/components/idavoll/copy-field";

export default function CopyFieldDemo() {
  return (
    <div className="grid max-w-xl gap-6">
      <CopyField
        label="Redirect URL"
        value="https://myserver.example.ts.net/api/connect/youtube/callback"
        hint="Paste this into Authorized redirect URIs in Google Cloud."
      />
      <CopyField
        label="Webhook URL"
        value="https://myserver.example.ts.net/api/webhooks/instagram?verify=challenge-tracker-7f3a9c2e5b1d4a8f"
      />
    </div>
  );
}
