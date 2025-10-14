import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarGroup,
  SidebarContent,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar,
  SidebarFooter,
  SidebarTrigger,
} from "../ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import logo from "/assets/images/banana.jpg";
import { LayoutDashboard, LucideProps, PlusSquare, Table2 } from "lucide-react";
import { ModeToggle } from "../theme/mode-toggle";
import { LanguageSwitcher } from "../theme/language-switcher";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface IMenuItem {
  title: string;
  url: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}

const getMenuItems = (t: (key: string) => string): IMenuItem[] => [
  {
    title: t("nav.dashboard"),
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: t("nav.newData"),
    url: "/new",
    icon: PlusSquare,
  },
  {
    title: t("nav.dataTable"),
    url: "/data",
    icon: Table2,
  },
];

export default function AppSideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { t } = useTranslation();
  const items = getMenuItems(t);

  return (
    <Sidebar collapsible="icon" accessKey="">
      <SidebarContent>
        <SidebarGroup className="space-y-2">
          <SidebarTrigger
            className={cn(
              "absolute z-10 top-1 right-0 transition-all",
              state === "collapsed" && "hidden"
            )}
          />
          <SidebarGroupLabel
            className="flex flex-row items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="Logo"
              className="w-8 h-8 object-contain rounded-lg"
            />
            <span className="text-primary font-bold text-xl">
              {t("common.appName")}
            </span>
          </SidebarGroupLabel>
          <SidebarSeparator />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <TooltipProvider key={item.title}>
                  <Tooltip>
                    <TooltipTrigger>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={item.url === location.pathname}
                        >
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </TooltipTrigger>
                    {state === "collapsed" && (
                      <TooltipContent side="right">
                        <p>{item.title}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter
        className={cn(
          "flex justify-center",
          state === "collapsed" ? "items-center" : "items-start"
        )}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild className="w-fit">
              <div>
                <ModeToggle />
              </div>
            </TooltipTrigger>
            {state === "collapsed" && (
              <TooltipContent side="right">
                <p>{t("common.toggleTheme")}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild className="w-fit">
              <div>
                <LanguageSwitcher />
              </div>
            </TooltipTrigger>
            {state === "collapsed" && (
              <TooltipContent side="right">
                <p>{t("common.switchLanguage")}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger
                className={cn(
                  "absolute z-10 bottom-12 right-3 transition-all",
                  state === "expanded" && "hidden"
                )}
              />
            </TooltipTrigger>
            {state === "collapsed" && (
              <TooltipContent side="right">
                <p>{t("common.openSidebar")}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </SidebarFooter>
    </Sidebar>
  );
}
