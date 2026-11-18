export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-bg-base px-5 pb-8 pt-7 sm:px-8 lg:px-10">
      {children}
    </main>
  );
}
