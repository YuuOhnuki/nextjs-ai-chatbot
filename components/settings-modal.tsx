"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { SiGoogle, SiGithub } from "@icons-pack/react-simple-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const { data: session } = useSession();
  const isOAuth = session?.account?.provider && session.account.provider !== "credentials";
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
    const savedResponseNotifications = localStorage.getItem("responseNotifications");
    const savedSoundNotifications = localStorage.getItem("soundNotifications");
    const savedAccentColor = localStorage.getItem("accentColor");

    if (savedMemoryEnabled !== null) setMemoryEnabled(JSON.parse(savedMemoryEnabled));
    if (savedMemoryPrompt) setMemoryPrompt(savedMemoryPrompt);
    if (savedAboutMe) setAboutMe(savedAboutMe);
    if (savedResponseNotifications !== null) setResponseNotifications(JSON.parse(savedResponseNotifications));
    if (savedSoundNotifications !== null) setSoundNotifications(JSON.parse(savedSoundNotifications));
    if (savedAccentColor) setAccentColor(savedAccentColor);
  }, []);

  const handleSave = () => {
    localStorage.setItem("memoryEnabled", JSON.stringify(memoryEnabled));
    localStorage.setItem("memoryPrompt", memoryPrompt);
    localStorage.setItem("aboutMe", aboutMe);
    localStorage.setItem("responseNotifications", JSON.stringify(responseNotifications));
    localStorage.setItem("soundNotifications", JSON.stringify(soundNotifications));
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
    } catch (error) {
      toast.error("An error occurred while deleting account");
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("settings")}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="general">{t("general")}</TabsTrigger>
              <TabsTrigger value="notifications">{t("notifications")}</TabsTrigger>
              <TabsTrigger value="customization">{t("customization")}</TabsTrigger>
              <TabsTrigger value="account">{t("account")}</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div>
                <Label htmlFor="appearance" className="text-base font-medium">
                  {t("appearance")}
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

              <div>
                <Label htmlFor="accentColor" className="text-base font-medium">
                  {t("accentColor")}
                </Label>
                <Input
                  id="accentColor"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="mt-2 w-full h-10"
                />
              </div>

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
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="ja">{t("japanese")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="responseNotifications" className="text-base font-medium">
                  {t("responseNotifications")}
                </Label>
                <Switch
                  id="responseNotifications"
                  checked={responseNotifications}
                  onCheckedChange={setResponseNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="soundNotifications" className="text-base font-medium">
                  {t("soundNotifications")}
                </Label>
                <Switch
                  id="soundNotifications"
                  checked={soundNotifications}
                  onCheckedChange={setSoundNotifications}
                />
              </div>
            </TabsContent>

            <TabsContent value="customization" className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="memoryEnabled" className="text-base font-medium">
                  {t("memoryEnabled")}
                </Label>
                <Switch
                  id="memoryEnabled"
                  checked={memoryEnabled}
                  onCheckedChange={setMemoryEnabled}
                />
              </div>

              <div>
                <Label htmlFor="memoryPrompt" className="text-base font-medium">
                  {t("memoryPrompt")}
                </Label>
                <Textarea
                  id="memoryPrompt"
                  value={memoryPrompt}
                  onChange={(e) => setMemoryPrompt(e.target.value)}
                  placeholder={t("memoryDescription")}
                  className="mt-2 min-h-24"
                />
              </div>

              <div>
                <Label htmlFor="aboutMe" className="text-base font-medium">
                  {t("aboutMe")}
                </Label>
                <Textarea
                  id="aboutMe"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder={t("aboutMeDescription")}
                  className="mt-2 min-h-24"
                />
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
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
                      {session?.account?.provider === "google" ? t("googleAccount") : session?.account?.provider === "github" ? t("githubAccount") : t("oauthAccount")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t("emailLabel")}</span>
                        <span className="text-sm">{session?.user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t("serviceLabel")}</span>
                        <span className="text-sm">
                          {session?.account?.provider === "google" ? "Google" : session?.account?.provider === "github" ? "GitHub" : "OAuth"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div>
                    <Label htmlFor="email" className="text-base font-medium">
                      {t("email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
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
                </>
              )}

              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium text-destructive mb-4">{t("deleteAccount")}</h3>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  {t("deleteAccount")}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("deleteAccountWarning")}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave}>
              {t("saveSettings")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>アカウント削除</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。アカウントを削除し、サーバーからデータを削除します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
