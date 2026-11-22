// Project developed by MohitSpace.in
console.log(
  "%c VMWjobs %c Licenced by MohitSpace.in %c https://mohitspace.in ",
  "background: #4338ca; color: #fff; font-size: 14px; padding: 4px 8px; border-radius: 4px 0 0 4px;",
  "background: #0f172a; color: #fff; font-size: 14px; padding: 4px 8px;",
  "background: #f59e0b; color: #0f172a; font-size: 14px; padding: 4px 8px; border-radius: 0 4px 4px 0;"
);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import '@fontsource-variable/inter'
import '@fontsource-variable/sora'
import App from './App.jsx'
import './index.css'
import LiveUpdate from './lib/liveUpdate.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Native app only. A downloaded bundle is applied at startup by MainActivity; here we
// confirm it rendered (so rollback can work) and quietly stage any newer bundle for next launch.
if (Capacitor.isNativePlatform()) {
  LiveUpdate.markReady().catch(() => {})
  LiveUpdate.sync().catch(() => {})
}
