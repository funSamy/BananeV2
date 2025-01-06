import { RouterProvider } from "react-router-dom";
import router from "./router";
import { ThemeProvider } from "./components/theme/theme-provider";
import { Toaster } from "sonner";

export default function App() {
  return (
    <ThemeProvider>
      <div className="h-screen w-full">
        <RouterProvider router={router} />
        <Toaster
          position="top-center"
          toastOptions={{
            unstyled: false,
          }}
        />
      </div>
    </ThemeProvider>
  );
}
