import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { RefreshCw, X } from "lucide-react";

export function PWAUpdatePrompt() {
  const { t } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered:", r);
    },
    onRegisterError(error) {
      console.log("SW registration error:", error);
    },
  });

  useEffect(() => {
    if (offlineReady || needRefresh) {
      setShowPrompt(true);
    }
  }, [offlineReady, needRefresh]);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">
              {needRefresh ? t("pwa.updateAvailable") : t("pwa.appReady")}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={close}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {needRefresh
              ? t("pwa.updateDescription")
              : t("pwa.offlineDescription")}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-2 pt-0">
          {needRefresh && (
            <Button
              onClick={() => updateServiceWorker(true)}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t("pwa.reload")}
            </Button>
          )}
          <Button variant="outline" onClick={close}>
            {needRefresh ? t("common.cancel") : t("pwa.close")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
