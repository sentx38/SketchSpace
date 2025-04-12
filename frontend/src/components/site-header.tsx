import { Separator } from "@/components/ui/separator"
import Link from "next/link";
import {HomeIcon} from "lucide-react";
import * as React from "react";

export function SiteHeader() {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <Link href="/"  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-transparent shadow-none text-neutral-400 hover:bg-accent hover:text-accent-foreground h-7 w-7 -ml-1">
              <HomeIcon />
          </Link>
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Панель Администратора</h1>
      </div>
    </header>
  )
}
