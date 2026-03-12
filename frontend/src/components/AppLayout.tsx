import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-card px-4 gap-3 shrink-0">
            <SidebarTrigger />
            <div className="flex-1" />
            <span className="text-sm text-muted-foreground">
              {user?.company} • {user?.role === "admin" ? "Administrator" : "Employee"}
            </span>
          </header>
          <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
