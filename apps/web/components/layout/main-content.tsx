export function MainContent({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-w-0 flex-1 overflow-y-auto bg-bg-base p-6">
            <div className="px-6 py-6 md:px-8 md:py-8">
                {children}
            </div>
        </main>
    )
}