import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { Download, X, Smartphone, Share2, ArrowUpRight } from 'lucide-react'

const APK_URL = import.meta.env.VITE_APK_URL || '/apk/VMWjobs-v1.0.apk'
const DISMISSED_KEY = 'vmw-install-prompt-dismissed'

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export default function InstallPrompt() {
  const location = useLocation()
  const [banner, setBanner] = useState(false)
  const [modal, setModal] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    if (Capacitor.isNativePlatform() || isStandalone()) return
    if (location.pathname === '/download') return
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    const onInstalled = () => {
      setBanner(false)
      setModal(false)
    }
    const check = () => setCanInstall(Boolean(window.__vmwInstallPrompt))

    check()
    window.addEventListener('appinstalled', onInstalled)
    const poll = setInterval(check, 1000)
    const timer = setTimeout(() => setBanner(true), 3500)

    return () => {
      clearInterval(poll)
      clearTimeout(timer)
      window.removeEventListener('appinstalled', onInstalled)
    }
    // Only run once on mount; route changes are not relevant to the banner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setBanner(false)
    setModal(false)
  }

  const install = async () => {
    const prompt = window.__vmwInstallPrompt
    if (!prompt) {
      setBanner(false)
      setModal(true)
      return
    }
    await prompt.prompt()
    await prompt.userChoice
    window.__vmwInstallPrompt = null
    setCanInstall(false)
    setBanner(false)
    setModal(false)
  }

  const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  return (
    <>
      {banner && !modal && (
        <div className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-6 sm:w-96">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl shadow-slate-900/20">
            <img
              src="/icons/icon-192.png"
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl ring-1 ring-slate-200"
            />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm font-bold text-ink">Get the VMWjobs app</p>
              <p className="m-0 mt-0.5 text-xs text-slate-500">
                Install for quick access to NCR jobs
              </p>
            </div>
            <button
              type="button"
              onClick={install}
              className="shrink-0 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              {canInstall ? 'Install' : 'Get app'}
            </button>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Smartphone className="h-6 w-6" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <h2 className="mt-4 text-xl font-bold text-ink">Install VMWjobs</h2>

            {iOS ? (
              <>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  On iPhone, tap the Share button, then <strong>Add to Home Screen</strong>.
                </p>
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <Share2 className="h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
                  <span>Share icon (square with an arrow up) → Add to Home Screen → Add</span>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add VMWjobs to your home screen for one-tap access — or download the Android app.
                </p>
                {canInstall && (
                  <button
                    type="button"
                    onClick={install}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Smartphone className="h-5 w-5" aria-hidden="true" />
                    Install app here
                  </button>
                )}
                <a
                  href={APK_URL}
                  download
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Download APK (4.8 MB)
                </a>
              </>
            )}

            <Link
              to="/download"
              onClick={() => setModal(false)}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Full install guide
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
