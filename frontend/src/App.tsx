import { RouterProvider } from "react-router-dom";
import router from "./router";
import { ThemeProvider } from "./components/theme/theme-provider";
import { Toaster } from "sonner";
import { QueryProvider } from "./providers/query-client";
import { PWAUpdatePrompt } from "./components/pwa/pwa-update-prompt";
import { PWAInstallPrompt } from "./components/pwa/pwa-install-prompt";

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <div className="h-screen w-full">
          <RouterProvider router={router} />
          <Toaster
            position="top-center"
            toastOptions={{
              unstyled: false,
            }}
          />
          <PWAUpdatePrompt />
          <PWAInstallPrompt />
        </div>
      </ThemeProvider>
    </QueryProvider>
  );
}
