import { Button } from "@/components/ui/button";
import image404 from "/assets/images/404.png";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <img src={image404} alt="404-image" className="w-[30rem] object-cover" />
      <p className="text-primary text-xl font-medium">
        The page your are looking for was not found
      </p>
      <div className="flex gap-3 mt-4">
        <Button
          variant={"outline"}
          className="transition-colors dark:text-secondaryForeground hover:bg-primary hover:text-primaryForeground"
          onClick={() => navigate("/", { replace: true })}
        >
          Return to home page
        </Button>
      </div>
    </div>
  );
}
