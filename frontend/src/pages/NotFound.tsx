import { Button } from "@/components/ui/button";
import image404 from "/assets/images/404.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <img src={image404} alt="404-image" className="w-[30rem] object-cover" />
      <p className="text-primary text-xl font-medium">{t("404.title")}</p>
      <div className="flex gap-3 mt-4">
        <Button
          variant={"outline"}
          className="transition-colors dark:text-secondaryForeground hover:bg-primary hover:text-primaryForeground"
          onClick={() => navigate("/", { replace: true })}
        >
          {t("404.btn")}
        </Button>
      </div>
    </div>
  );
}
