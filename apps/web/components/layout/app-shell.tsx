import { MainContent } from "./main-content";
import { Sidebar } from "./sidebar";
import { Header } from "./header"

export function AppShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex h-screen w-full bg-bg-base text-text-primary overflow-hidden">
            
            <div className="absolute top-0 left-0 z-20">
                <Sidebar />
            </div>
            
            <div className="flex flex-1 flex-col min-w-0 w-full">
                <Header />
                <MainContent>
                    {children}
                </MainContent>
            </div>
            
        </div>
    )
}