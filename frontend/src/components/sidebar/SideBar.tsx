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
import { cn } from "@/lib/utils";

interface IMenuItem {
  title: string;
  url: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}

// menu items
const items: IMenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "New Data",
    url: "/new",
    icon: PlusSquare,
  },
  {
    title: "Data Table",
    url: "/data",
    icon: Table2,
  },
];

export default function AppSideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();

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
              Gestion Banane
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
                <p>Toggle theme</p>
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
                <p>Open sidebar</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </SidebarFooter>
    </Sidebar>
  );
}
