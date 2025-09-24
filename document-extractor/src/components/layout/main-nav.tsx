"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Eye,
  Settings,
  BarChart3
} from "lucide-react";

const navItems = [
  {
    title: "Upload",
    href: "/upload",
    icon: Upload,
    description: "Upload and extract invoice data"
  },
  {
    title: "View",
    href: "/view",
    icon: Eye,
    description: "View and edit invoice details"
  },
  {
    title: "Manage",
    href: "/manage",
    icon: Settings,
    description: "Manage all invoices"
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "View analytics and insights"
  }
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-1 lg:space-x-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (pathname === "/" && item.href === "/upload");

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "flex items-center gap-2 transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:block">{item.title}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}