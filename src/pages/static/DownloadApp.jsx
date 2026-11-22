import { Link } from "react-router-dom";
import { ArrowLeft, Download, Smartphone, ShieldCheck, Info } from "lucide-react";
import useSeo from "../../hooks/useSeo";

const APK_URL = import.meta.env.VITE_APK_URL || "/apk/VMWjobs-v1.0.apk";
const APK_SHA256 = "DFA459BC9A107BC238D4C8E5BDBE132B4E91B21C95983FED63149438ED3F9086";

export default function DownloadApp() {
  useSeo({ title: "Download the VMWjobs App | Delhi NCR Jobs", description: "Download the free VMWjobs app to browse private-sector jobs in Noida, Greater Noida, Gurugram and Delhi NCR.", path: "/download" });
  return (
    <div className="page-shell">
      <div className="container-page max-w-4xl py-10 sm:py-14">
        <Link to="/" className="link-arrow mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Get the VMWjobs app</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Browse NCR jobs on the go. Choose the option that works best for your phone â€”
          both are free and use the same jobs and accounts as this website.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <section className="card p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Smartphone className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-ink">Android app (APK)</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The full native app, bundled with the site so it works offline. Best for Android users.
            </p>
            <a
              href={APK_URL}
              download
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Download className="h-5 w-5" aria-hidden="true" />
              Download APK (4.8 MB)
            </a>
            <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
              <li>Open the downloaded file on your phone.</li>
              <li>Allow â€œInstall unknown appsâ€ when Android asks.</li>
              <li>Tap Install and open VMWjobs.</li>
            </ol>
          </section>

          <section className="card p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Download className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-ink">Install as a web app</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No download needed. Works on Android, iPhone and desktop â€” updates automatically.
            </p>
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <p className="m-0 font-semibold text-ink">On Android (Chrome)</p>
              <p className="mt-1">Menu (â‹®) â†’ <strong>Install app</strong> or â€œAdd to Home screenâ€.</p>
              <p className="mt-3 m-0 font-semibold text-ink">On iPhone (Safari)</p>
              <p className="mt-1">Share button â†’ <strong>Add to Home Screen</strong>.</p>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              It will appear on your home screen and open full-screen, just like an app.
            </p>
          </section>
        </div>

        <div className="card mt-6 flex items-start gap-3 border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="m-0">
            This APK is signed with our own key. If you already have an older VMWjobs install,
            uninstall it first. The Play Store version is coming soon â€” once published, use the
            Play Store for automatic updates.
          </p>
        </div>

        <div className="card mt-4 flex items-start gap-3 p-5 text-sm leading-6 text-slate-600">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="m-0 break-all">
            <strong className="text-ink">APK SHA-256:</strong> {APK_SHA256}
          </p>
        </div>
      </div>
    </div>
  );
}
