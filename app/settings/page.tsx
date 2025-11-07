"use client";

import { useRouter } from "next/navigation";
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
import { useTranslation } from "@/hooks/use-translation";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [memory, setMemory] = useState("");
  const [accentColor, setAccentColor] = useState("blue");
  const [highlightColor, setHighlightColor] = useState("#3b82f6");
  const [notificationSound, setNotificationSound] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const accentColors = [
    { value: "blue", label: t("blue"), color: "#006cff" },
    { value: "green", label: t("green"), color: "#10b981" },
    { value: "purple", label: t("purple"), color: "#8b5cf6" },
    { value: "red", label: t("red"), color: "#ef4444" },
    { value: "orange", label: t("orange"), color: "#f97316" },
    { value: "pink", label: t("pink"), color: "#ec4899" },
  ];

  useEffect(() => {
    const savedMemory = localStorage.getItem("memory");
    if (savedMemory) setMemory(savedMemory);
    const savedAccentColor = localStorage.getItem("accentColor");
    if (savedAccentColor) setAccentColor(savedAccentColor);
    const savedHighlightColor = localStorage.getItem("highlightColor");
    if (savedHighlightColor) setHighlightColor(savedHighlightColor);
    const savedNotificationSound = localStorage.getItem("notificationSound");
    if (savedNotificationSound) setNotificationSound(savedNotificationSound === "true");
    const savedPushNotifications = localStorage.getItem("pushNotifications");
    if (savedPushNotifications) setPushNotifications(savedPushNotifications === "true");
  }, []);

  const handleSave = () => {
    localStorage.setItem("memory", memory);
    localStorage.setItem("accentColor", accentColor);
    localStorage.setItem("highlightColor", highlightColor);
    localStorage.setItem("notificationSound", notificationSound.toString());
    localStorage.setItem("pushNotifications", pushNotifications.toString());
    if (pushNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    // CSSカスタムプロパティを設定
    const selectedColor = accentColors.find(color => color.value === accentColor);
    if (selectedColor) {
      document.documentElement.style.setProperty('--accent-color', selectedColor.color);
    }
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("accountDeleted"));
        signOut({ redirectTo: "/" });
      } else {
        toast.error(t("deleteAccountFailed"));
      }
    } catch (_error) {
      toast.error(t("deleteAccountError"));
    }
    setShowDeleteDialog(false);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-lg bg-card p-6 shadow-lg md:p-8">
        <h1 className="mb-8 text-center font-bold text-3xl">{t("settings")}</h1>

        <Tabs className="w-full" defaultValue="account">
          <TabsList className="mb-6 grid w-full grid-cols-4">
            <TabsTrigger value="account">{t("account")}</TabsTrigger>
            <TabsTrigger value="memory">{t("memory")}</TabsTrigger>
            <TabsTrigger value="theme">{t("theme")}</TabsTrigger>
            <TabsTrigger value="notifications">{t("notifications")}</TabsTrigger>
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
                placeholder={t("passwordPlaceholder")}
                type="password"
                value={password}
              />
            </div>
            {session?.user?.type === "regular" && (
              <div className="border-t pt-6">
                <h3 className="mb-4 font-medium text-destructive text-lg">
                  {t("dangerZone")}
                </h3>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                >
                  {t("deleteAccount")}
                </Button>
                <p className="mt-2 text-muted-foreground text-sm">
                  {t("deleteAccountWarningText")}
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

            <div>
              <Label className="font-medium text-base" htmlFor="accentColor">
                {t("accentColor")}
              </Label>
              <Select onValueChange={setAccentColor} value={accentColor}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder={t("selectAccentColor")} />
                </SelectTrigger>
                <SelectContent>
                  {accentColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.color }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent className="space-y-6" value="notifications">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-base" htmlFor="notificationSound">
                {t("notificationSound")}
              </Label>
              <Switch
                id="notificationSound"
                checked={notificationSound}
                onCheckedChange={setNotificationSound}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-medium text-base" htmlFor="pushNotifications">
                {t("pushNotifications")}
              </Label>
              <Switch
                id="pushNotifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
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
            <AlertDialogTitle>{t("deleteAccountTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteAccountDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>
              {t("deleteAccount")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
