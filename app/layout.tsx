import "./globals.css";

// The <html>/<body> shell lives in app/[locale]/layout.tsx so that the `lang`
// attribute can follow the active locale. Every user-facing route is served
// through that segment (the intl middleware rewrites `/` to the default locale).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
