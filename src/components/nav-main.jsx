"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({ items }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-white font-medium text-sm mb-3 mt-4">
        Dashboard
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className={`text-white cursor-pointer mt-2 w-full text-left px-3 py-2 rounded-md flex items-center gap-2
                    ${
                      item.isActive
                        ? "bg-white text-[#2C514C] hover:text-[#2C514C] border-white font-semibold"
                        : "hover:bg-white text-white"
                    }
                  `}
                >
                  {item.icon && <item.icon className="size-4 shrink-0" />}
                  <span className="text-[16px]">{item.title}</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>

              {/* Optional: Submenu */}
              {item.children && item.children.length > 0 && (
                <CollapsibleContent className="ml-6 mt-1 space-y-1">
                  {item.children.map((subItem) => (
                    <SidebarMenuButton
                      key={subItem.title}
                      className={`text-white text-sm px-2 py-1 rounded-md w-full text-left ${
                        subItem.isActive
                          ? "bg-white/10 border-l-2 border-white font-medium"
                          : "hover:bg-white/5"
                      }`}
                    >
                      {subItem.title}
                    </SidebarMenuButton>
                  ))}
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
