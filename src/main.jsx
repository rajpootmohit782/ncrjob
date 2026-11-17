// Project developed by MohitSpace.in
console.log(
  "%c VMWjobs %c Licenced by MohitSpace.in %c https://mohitspace.in ",
  "background: #4338ca; color: #fff; font-size: 14px; padding: 4px 8px; border-radius: 4px 0 0 4px;",
  "background: #0f172a; color: #fff; font-size: 14px; padding: 4px 8px;",
  "background: #f59e0b; color: #0f172a; font-size: 14px; padding: 4px 8px; border-radius: 0 4px 4px 0;"
);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/sora'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
