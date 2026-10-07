import Image from "next/image";
import { PanelLeft } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden h-[96vh] rounded-lg w-60 m-4 shrink-0 flex-col border border-border-subtle bg-bg-primary/25 md:flex">
      <div className="flex h-15 items-center px-5 ">
        <Image 
            src="/logo/logo-256.png"
            width={200}
            height={200}
            alt="picture of the logo"
            loading="eager"
          />
          <PanelLeft 
            size={25}
            color="white"
            className="opacity-70 transition-opacity duration-200 hover:opacity-100 cursor-pointer"
          />
      </div>

      <nav
        aria-label="Primary navigation"
        className="flex-1 px-3 py-4"
      >
        
      </nav>
    </aside>
  );
}