'use client'

import { Suspense } from 'react'
import SelectRepositoriesClient from './select-repositories-client'

export default function SelectRepositoriesRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading repositories…
        </div>
      }
    >
      <SelectRepositoriesClient />
    </Suspense>
  )
}
