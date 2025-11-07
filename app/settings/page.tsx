"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
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
    } catch (error) {
      toast.error("An error occurred while deleting account");
    }
    setShowDeleteDialog(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{t("settings")}</h1>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="account">{t("account")}</TabsTrigger>
            <TabsTrigger value="memory">{t("memory")}</TabsTrigger>
            <TabsTrigger value="theme">{t("theme")}</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-base font-medium">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-base font-medium">
                {t("password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2"
              />
            </div>
            {session?.user?.type === "regular" && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium text-destructive mb-4">Danger Zone</h3>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Account
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This action cannot be undone. This will permanently delete your account and all associated data.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="memory" className="space-y-6">
            <div>
              <Label htmlFor="memory" className="text-base font-medium">
                {t("commonPromptMemory")}
              </Label>
              <Textarea
                id="memory"
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                placeholder={t("memoryDescription")}
                className="mt-2 min-h-32"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {t("memoryDescription")}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="theme" className="space-y-6">
            <div>
              <Label htmlFor="language" className="text-base font-medium">
                {t("displayLanguage")}
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder={t("selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("english")}</SelectItem>
                  <SelectItem value="ja">{t("japanese")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="theme" className="text-base font-medium">
                {t("themeColor")}
              </Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full mt-2">
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>Delete Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
