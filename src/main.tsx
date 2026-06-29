import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App'
import { UpdatePrompt } from './shared/components/UpdatePrompt'
import './index.css'

// Unregister any cached service workers when running as native app —
// the service worker interferes with API navigation in Capacitor's webview
if (Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((r) => {
      r.unregister()
      console.log('Service worker unregistered for native app')
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <UpdatePrompt />
  </React.StrictMode>
)