"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [memory, setMemory] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    localStorage.setItem("memory", memory);
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Account deleted successfully");
        signOut({ redirectTo: "/" });
      } else {
        toast.error("Failed to delete account");
      }
    } catch (_error) {
      toast.error("An error occurred while deleting account");
    }
    setShowDeleteDialog(false);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-lg bg-card p-6 shadow-lg md:p-8">
        <h1 className="mb-8 text-center font-bold text-3xl">{t("settings")}</h1>

        <Tabs className="w-full" defaultValue="account">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="account">{t("account")}</TabsTrigger>
            <TabsTrigger value="memory">{t("memory")}</TabsTrigger>
            <TabsTrigger value="theme">{t("theme")}</TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-6" value="account">
            <div>
              <Label className="font-medium text-base" htmlFor="email">
                {t("email")}
              </Label>
              <Input
                className="mt-2"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
                value={email}
              />
            </div>
            <div>
              <Label className="font-medium text-base" htmlFor="password">
                {t("password")}
              </Label>
              <Input
                className="mt-2"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                value={password}
              />
            </div>
            {session?.user?.type === "regular" && (
              <div className="border-t pt-6">
                <h3 className="mb-4 font-medium text-destructive text-lg">
                  Danger Zone
                </h3>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                >
                  Delete Account
                </Button>
                <p className="mt-2 text-muted-foreground text-sm">
                  This action cannot be undone. This will permanently delete
                  your account and all associated data.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent className="space-y-6" value="memory">
            <div>
              <Label className="font-medium text-base" htmlFor="memory">
                {t("commonPromptMemory")}
              </Label>
              <Textarea
                className="mt-2 min-h-32"
                id="memory"
                onChange={(e) => setMemory(e.target.value)}
                placeholder={t("memoryDescription")}
                value={memory}
              />
              <p className="mt-2 text-muted-foreground text-sm">
                {t("memoryDescription")}
              </p>
            </div>
          </TabsContent>

          <TabsContent className="space-y-6" value="theme">
            <div>
              <Label className="font-medium text-base" htmlFor="language">
                {t("displayLanguage")}
              </Label>
              <Select onValueChange={setLanguage} value={language}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder={t("selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("english")}</SelectItem>
                  <SelectItem value="ja">{t("japanese")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-medium text-base" htmlFor="theme">
                {t("themeColor")}
              </Label>
              <Select onValueChange={setTheme} value={theme}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder={t("selectTheme")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("light")}</SelectItem>
                  <SelectItem value="dark">{t("dark")}</SelectItem>
                  <SelectItem value="system">{t("system")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} size="lg">
            {t("saveSettings")}
          </Button>
        </div>
      </div>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
