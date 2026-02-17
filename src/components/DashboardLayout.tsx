import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border/50 flex items-center px-4 gap-4 bg-background/80 backdrop-blur-sm">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                S
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
