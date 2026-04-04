"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Lightbulb, BarChart2, Hash, Camera, TrendingUp, BookOpen, Calendar, Grid3X3, Phone, Target, Rocket, FileText, Star, DollarSign, Mail } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/posts", label: "Posts", icon: FileText },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/grid", label: "Grid Preview", icon: Grid3X3 },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/launches", label: "Launches", icon: Rocket },
  { href: "/series", label: "Series", icon: BookOpen },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/keywords", label: "Keywords", icon: Hash },
  { href: "/shoots", label: "Shoots", icon: Camera },
  { href: "/inspo", label: "Inspo Vault", icon: Star },
  { href: "/substack", label: "Substack", icon: Mail },
  { href: "/brand-deals", label: "Brand Deals", icon: DollarSign },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside style={{ width: 220, flexShrink: 0, background: "var(--color-background-secondary)", borderRight: "0.5px solid var(--color-border)", height: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "28px 20px 16px", borderBottom: "0.5px solid var(--color-border)" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "var(--color-ink-primary)", letterSpacing: "0.02em" }}>The Digital Empire</div>
        <div style={{ fontSize: 10, color: "var(--color-ink-tertiary)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>Content OS</div>
      </div>
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, marginBottom: 2, textDecoration: "none", background: active ? "var(--color-gold-light)" : "transparent", color: active ? "var(--color-gold)" : "var(--color-ink-secondary)", fontFamily: "Jost, sans-serif", fontSize: 13, fontWeight: active ? 500 : 400, transition: "all 0.15s" }}>
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
