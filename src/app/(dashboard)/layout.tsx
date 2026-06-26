export const dynamic = 'force-dynamic'

import PanelSidebar from "@/components/panel/PanelSidebar";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-surface-bg text-on-surface font-body">
        {/* Riel de navegación fijo (Luminous Ed-Tech) */}
        <PanelSidebar />

        {/* Área de contenido — desplazada por el ancho del riel (w-20) */}
        <main className="ml-20 min-h-screen overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 py-10 lg:py-14">
            {children}
          </div>
        </main>
      </div>
    </ConfirmProvider>
  );
}
