"use client";

import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const { data: session } = useSession();
  const isOAuth =
    session?.account?.provider && session.account.provider !== "credentials";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [memoryPrompt, setMemoryPrompt] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [responseNotifications, setResponseNotifications] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Load settings from localStorage or defaults
    const savedMemoryEnabled = localStorage.getItem("memoryEnabled");
    const savedMemoryPrompt = localStorage.getItem("memoryPrompt");
    const savedAboutMe = localStorage.getItem("aboutMe");
    const savedResponseNotifications = localStorage.getItem(
      "responseNotifications"
    );
    const savedSoundNotifications = localStorage.getItem("soundNotifications");
    const savedAccentColor = localStorage.getItem("accentColor");

    if (savedMemoryEnabled !== null) {
      setMemoryEnabled(JSON.parse(savedMemoryEnabled));
    }
    if (savedMemoryPrompt) {
      setMemoryPrompt(savedMemoryPrompt);
    }
    if (savedAboutMe) {
      setAboutMe(savedAboutMe);
    }
    if (savedResponseNotifications !== null) {
      setResponseNotifications(JSON.parse(savedResponseNotifications));
    }
    if (savedSoundNotifications !== null) {
      setSoundNotifications(JSON.parse(savedSoundNotifications));
    }
    if (savedAccentColor) {
      setAccentColor(savedAccentColor);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("memoryEnabled", JSON.stringify(memoryEnabled));
    localStorage.setItem("memoryPrompt", memoryPrompt);
    localStorage.setItem("aboutMe", aboutMe);
    localStorage.setItem(
      "responseNotifications",
      JSON.stringify(responseNotifications)
    );
    localStorage.setItem(
      "soundNotifications",
      JSON.stringify(soundNotifications)
    );
    localStorage.setItem("accentColor", accentColor);
    toast.success("Settings saved successfully");
    onOpenChange(false);
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
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("settings")}</DialogTitle>
          </DialogHeader>

          <Tabs className="w-full" defaultValue="general">
            <TabsList className="mb-6 grid w-full grid-cols-4">
              <TabsTrigger value="general">{t("general")}</TabsTrigger>
              <TabsTrigger value="notifications">
                {t("notifications")}
              </TabsTrigger>
              <TabsTrigger value="customization">
                {t("customization")}
              </TabsTrigger>
              <TabsTrigger value="account">{t("account")}</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-6" value="general">
              <div>
                <Label className="font-medium text-base" htmlFor="appearance">
                  {t("appearance")}
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

              <div>
                <Label className="font-medium text-base" htmlFor="accentColor">
                  {t("accentColor")}
                </Label>
                <Input
                  className="mt-2 h-10 w-full"
                  id="accentColor"
                  onChange={(e) => setAccentColor(e.target.value)}
                  type="color"
                  value={accentColor}
                />
              </div>

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
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="ja">{t("japanese")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent className="space-y-6" value="notifications">
              <div className="flex items-center justify-between">
                <Label
                  className="font-medium text-base"
                  htmlFor="responseNotifications"
                >
                  {t("responseNotifications")}
                </Label>
                <Switch
                  checked={responseNotifications}
                  id="responseNotifications"
                  onCheckedChange={setResponseNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  className="font-medium text-base"
                  htmlFor="soundNotifications"
                >
                  {t("soundNotifications")}
                </Label>
                <Switch
                  checked={soundNotifications}
                  id="soundNotifications"
                  onCheckedChange={setSoundNotifications}
                />
              </div>
            </TabsContent>

            <TabsContent className="space-y-6" value="customization">
              <div className="flex items-center justify-between">
                <Label
                  className="font-medium text-base"
                  htmlFor="memoryEnabled"
                >
                  {t("memoryEnabled")}
                </Label>
                <Switch
                  checked={memoryEnabled}
                  id="memoryEnabled"
                  onCheckedChange={setMemoryEnabled}
                />
              </div>

              <div>
                <Label className="font-medium text-base" htmlFor="memoryPrompt">
                  {t("memoryPrompt")}
                </Label>
                <Textarea
                  className="mt-2 min-h-24"
                  id="memoryPrompt"
                  onChange={(e) => setMemoryPrompt(e.target.value)}
                  placeholder={t("memoryDescription")}
                  value={memoryPrompt}
                />
              </div>

              <div>
                <Label className="font-medium text-base" htmlFor="aboutMe">
                  {t("aboutMe")}
                </Label>
                <Textarea
                  className="mt-2 min-h-24"
                  id="aboutMe"
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder={t("aboutMeDescription")}
                  value={aboutMe}
                />
              </div>
            </TabsContent>

            <TabsContent className="space-y-6" value="account">
              {isOAuth ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {session?.account?.provider === "google" ? (
                        <SiGoogle size={20} />
                      ) : session?.account?.provider === "github" ? (
                        <SiGithub size={20} />
                      ) : (
                        <SiGoogle size={20} />
                      )}
                      {session?.account?.provider === "google"
                        ? t("googleAccount")
                        : session?.account?.provider === "github"
                          ? t("githubAccount")
                          : t("oauthAccount")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {t("emailLabel")}
                        </span>
                        <span className="text-sm">{session?.user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {t("serviceLabel")}
                        </span>
                        <span className="text-sm">
                          {session?.account?.provider === "google"
                            ? "Google"
                            : session?.account?.provider === "github"
                              ? "GitHub"
                              : "OAuth"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div>
                    <Label className="font-medium text-base" htmlFor="email">
                      {t("email")}
                    </Label>
                    <Input
                      className="mt-2"
                      id="email"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
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
                </>
              )}

              <div className="border-t pt-6">
                <h3 className="mb-4 font-medium text-destructive text-lg">
                  {t("deleteAccount")}
                </h3>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                >
                  {t("deleteAccount")}
                </Button>
                <p className="mt-2 text-muted-foreground text-sm">
                  {t("deleteAccountWarning")}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end gap-2">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              {t("cancel")}
            </Button>
            <Button onClick={handleSave}>{t("saveSettings")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>アカウント削除</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。アカウントを削除し、サーバーからデータを削除します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
