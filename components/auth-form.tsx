import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import Form from "next/form";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";

export function AuthForm({
  action,
  children,
  defaultEmail = "",
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  const { t } = useTranslation();

  const handleOAuthSignIn = (provider: string) => {
    signIn(provider);
  };

  return (
    <div className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-4">
        <Button
          aria-label={t("continueWithGoogle")}
          className="h-12 w-full justify-start gap-3 shadow-sm transition-shadow hover:shadow-md"
          onClick={() => handleOAuthSignIn("google")}
          variant="outline"
        >
          <SiGoogle size={20} />
          {t("continueWithGoogle")}
        </Button>
        <Button
          aria-label={t("continueWithGitHub")}
          className="h-12 w-full justify-start gap-3 shadow-sm transition-shadow hover:shadow-md"
          onClick={() => handleOAuthSignIn("github")}
          variant="outline"
        >
          <SiGithub size={20} />
          {t("continueWithGitHub")}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      <Form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label
            className="font-normal text-zinc-600 dark:text-zinc-400"
            htmlFor="email"
          >
            {t("email")}
          </Label>

          <Input
            autoComplete="email"
            autoFocus
            className="bg-muted text-md md:text-sm"
            defaultValue={defaultEmail}
            id="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            required
            type="email"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            className="font-normal text-zinc-600 dark:text-zinc-400"
            htmlFor="password"
          >
            {t("password")}
          </Label>

          <Input
            className="bg-muted text-md md:text-sm"
            id="password"
            name="password"
            required
            type="password"
          />
        </div>

        {children}
      </Form>
    </div>
  );
}
