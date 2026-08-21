import React from "react"
import { createRoot } from "react-dom/client"
import Home from "synnical-source/src/app/page"
import { Toaster } from "synnical-source/src/components/ui/toaster"
import { Toaster as SonnerToaster } from "synnical-source/src/components/ui/sonner"
import { AuthProvider } from "synnical-source/src/hooks/use-auth"
import { UserProfileProvider } from "synnical-source/src/components/user-profile-modal"
import { ThemeApplier } from "synnical-source/src/components/theme-applier"
import { SettingsApplier } from "synnical-source/src/components/settings-generic"
import { AdInjector } from "synnical-source/src/components/ad-injector"

const root = document.getElementById("root")
if (!root) throw new Error("Synnical SVG root element is missing")

const showFatalError = (error: unknown) => {
  const detail = error instanceof Error ? error.stack || error.message : String(error)
  root.innerHTML = ""
  const panel = document.createElement("pre")
  panel.setAttribute("style", "box-sizing:border-box;margin:0;padding:24px;white-space:pre-wrap;font:14px monospace;color:#ff8b8b;background:#050505;width:100%;height:100%")
  panel.textContent = `Synnical failed to render.\n${detail}`
  root.appendChild(panel)
}

createRoot(root, { onUncaughtError: showFatalError }).render(
  <AuthProvider>
    <UserProfileProvider>
      <ThemeApplier />
      <SettingsApplier />
      <AdInjector />
      <Home />
    </UserProfileProvider>
    <Toaster />
    <SonnerToaster />
  </AuthProvider>,
)
