"use client"

import dynamic from 'next/dynamic'

// Dynamically import the App component to avoid SSR issues
const App = dynamic(() => import("../frontend/src/App"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  )
})

export default function SyntheticV0PageForDeployment() {
  return <App />
}