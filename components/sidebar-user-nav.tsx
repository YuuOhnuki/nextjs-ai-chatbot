"use client";

import { ChevronUp, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTranslation } from "@/hooks/use-translation";
import { guestRegex } from "@/lib/constants";
import { LoaderIcon } from "./icons";
import { SettingsModal } from "./settings-modal";
import { toast } from "./toast";

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isGuest = guestRegex.test(data?.user?.email ?? "");

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {status === "loading" ? (
                <SidebarMenuButton className="h-10 justify-between bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="flex flex-row gap-2">
                    <div className="size-6 animate-pulse rounded-full bg-zinc-500/30" />
                    <span className="animate-pulse rounded-md bg-zinc-500/30 text-transparent">
                      {t("loadingAuthStatus")}
                    </span>
                  </div>
                  <div className="animate-spin text-zinc-500">
                    <LoaderIcon />
                  </div>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  className="h-10 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  data-testid="user-nav-button"
                >
                  <Image
                    alt={user.email ?? "User Avatar"}
                    className="rounded-full"
                    height={24}
                    src={
                      data?.user?.image ||
                      `https://avatar.vercel.sh/${user.email}`
                    }
                    width={24}
                  />
                  <span className="truncate" data-testid="user-email">
                    {isGuest ? "Guest" : user?.name || user?.email}
                  </span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-popper-anchor-width)"
              data-testid="user-nav-menu"
              side="top"
            >
              {!isGuest && (
                <div className="border-b px-2 py-1.5 text-muted-foreground text-sm">
                  {user?.email}
                </div>
              )}
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 px-3 py-2"
                data-testid="user-nav-item-settings"
                onSelect={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
                {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuItem asChild data-testid="user-nav-item-auth">
                <button
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2"
                  onClick={() => {
                    if (status === "loading") {
                      toast({
                        type: "error",
                        description: t("checkingAuthStatus"),
                      });

                      return;
                    }

                    if (isGuest) {
                      router.push("/login");
                    } else {
                      signOut({
                        redirectTo: "/",
                      });
                    }
                  }}
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  {isGuest ? t("loginToYourAccount") : t("signOut")}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <SettingsModal onOpenChange={setSettingsOpen} open={settingsOpen} />
    </>
  );
}
