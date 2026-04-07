import DashboardHeader from "@/components/layout/DashboardHeader";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardFooter from "@/components/layout/DashboardFooter";
import { SidebarProvider } from "@/components/layout/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#a5b9c9] dark:bg-[#253444] text-slate-800 dark:text-white overflow-hidden transition-colors duration-500">
        
        {/* Sidebar manejado por el Context */}
        <DashboardSidebar />

        {/* Contenedor principal */}
        <div className="flex-1 flex flex-col relative z-0 w-full min-w-0 transition-all duration-300">
          <DashboardHeader />

          {/* Área de contenido scrollable */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto mb-10 w-full">
              {children}
            </div>
          </main>

          <DashboardFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
