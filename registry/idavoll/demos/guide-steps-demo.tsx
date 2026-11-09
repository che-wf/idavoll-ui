import { GuideSteps } from "@/components/idavoll/guide-steps";

export default function GuideStepsDemo() {
  return (
    <GuideSteps
      checkable
      steps={[
        {
          title: "Open Google Cloud Console and create a project",
          body: "Name it anything, e.g. “Challenge tracker”.",
          href: "https://console.cloud.google.com/projectcreate",
          linkLabel: "Open Google Cloud Console",
        },
        {
          title: "Turn on the YouTube Data API v3 and YouTube Analytics API",
          href: "https://console.cloud.google.com/apis/library",
          linkLabel: "Open the API Library",
        },
        {
          title: "Create an OAuth client ID (Web application)",
          body: "Under Authorized redirect URIs, add this address exactly:",
          copyValue: "https://myserver.example.ts.net/api/connect/youtube/callback",
          copyLabel: "Redirect URL",
        },
        {
          title: "Set the app to “In production”",
          body: "Apps left in Testing lose access after 7 days, and the numbers for those days can't be fetched later.",
          tone: "warning",
        },
        { title: "Paste the Client ID and Client Secret into the form" },
      ]}
    />
  );
}
