import { cn, getCookie } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLayoutEffect, useState } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLogin } from "@/hooks/auth/use-login";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// type FormSchema = z.infer<typeof formSchema>;

export default function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const formSchema = z.object({
    email: z.string().email({ message: t("validation.invalidEmail") }),
    password: z
      .string()
      .trim()
      .min(6, { message: t("validation.passwordMin") })
      .max(20, { message: t("validation.passwordMax") }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "admin@admin.com",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await login.mutateAsync(values);
      console.log({ response });

      // Check for returnUrl in search params
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        // Decode and navigate to the return URL
        navigate(decodeURIComponent(returnUrl), { replace: true });
      } else {
        // Default redirect to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(t("auth.loginFailed"));
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    if (getCookie("token")) navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {t("auth.login")}
          </CardTitle>
          <CardDescription>{t("auth.enterPassword")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-8 grid"
              autoComplete="off"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        disabled={true}
                        placeholder={t("auth.enterYourEmail")}
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••"
                          autoComplete="off"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </span>
              <Button type="submit" disabled={login.isPending}>
                {login.isPending ? (
                  <Loader className="animate-spin text-primaryForeground" />
                ) : (
                  t("auth.login")
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
