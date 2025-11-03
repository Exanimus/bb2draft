import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRoot from './AppRoot.tsx'
import './index.css'

import { ConvexProvider } from "convex/react"
import { ConvexReactClient } from "convex/react"

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
	<AppRoot />
	</ConvexProvider>
  </React.StrictMode>,
)
