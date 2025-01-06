import AppSideBar from "@/components/sidebar/SideBar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="h-screen">
      <SidebarProvider>
        <AppSideBar />
        <SidebarInset>
          <div className="h-full overflow-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
