import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { authStorage, useAuthUser } from "@/lib/auth";
import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const { isMfaRequired, token } = useAuthUser();
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  React.useEffect(() => {
    if (!token || !isMfaRequired) {
      navigate("/login");
    }
  }, [token, isMfaRequired, navigate]);

  const form = useForm({
    defaultValues: {
      code: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (code: string) => {
      const endpoint = isRecoveryMode ? "/admin/recover" : "/admin/verify-otp";
      const res = await api.post(
        endpoint,
        { code },
        {
          headers: {
            Authorization: `Bearer ${authStorage.getToken()}`,
          },
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (isRecoveryMode) {
        toast.success("Pemulihan berhasil. Silakan login kembali.");
        authStorage.clearToken();
        window.location.href = "/login";
      } else {
        toast.success("Verifikasi berhasil");
        authStorage.setToken(data.token);
        window.location.href = "/";
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Kode salah atau expired");
      form.reset();
    },
  });
  const onSubmit = (values: { code: string }) => {
    mutate(values.code);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-linear-to-br from-indigo-300/20 px-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
            {isRecoveryMode ? "Recovery Akun" : "Otentikasi Dua Faktor"}
          </CardTitle>
          <CardDescription>
            {isRecoveryMode
              ? "Masukkan kode pemulihan (recovery code) Anda."
              : "Masukkan 6 digit kode keamanan dari aplikasi authenticator Anda."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col items-center space-y-6"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center w-full">
                    <FormLabel className="sr-only">Kode OTP</FormLabel>
                    <FormControl>
                      {isRecoveryMode ? (
                        /* Tampilan Input Recovery Code */
                        <Input
                          {...field}
                          className="h-12 text-center font-mono font-bold uppercase tracking-widest"
                          placeholder="KODE-RECOVERY"
                          autoFocus
                        />
                      ) : (
                        /* Tampilan OTP Asli Kamu */
                        <InputOTP
                          maxLength={6}
                          disabled={isPending}
                          {...field}
                          onComplete={(value) => mutate(value)}
                        >
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot
                              index={0}
                              className="h-12 w-12 text-lg font-bold"
                            />
                            <InputOTPSlot
                              index={1}
                              className="h-12 w-12 text-lg font-bold"
                            />
                            <InputOTPSlot
                              index={2}
                              className="h-12 w-12 text-lg font-bold"
                            />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot
                              index={3}
                              className="h-12 w-12 text-lg font-bold"
                            />
                            <InputOTPSlot
                              index={4}
                              className="h-12 w-12 text-lg font-bold"
                            />
                            <InputOTPSlot
                              index={5}
                              className="h-12 w-12 text-lg font-bold"
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Tombol submit muncul jika mode recovery atau loading */}
              {isRecoveryMode && (
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold"
                  disabled={isPending}
                >
                  {isPending ? "Memproses..." : "Verifikasi Recovery"}
                </Button>
              )}
            </form>
          </Form>

          <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground border-t pt-4">
            <button
              onClick={() => {
                setIsRecoveryMode(!isRecoveryMode);
                form.reset();
              }}
              className="text-indigo-600 hover:underline cursor-pointer"
            >
              {isRecoveryMode ? "Gunakan OTP" : "Gunakan Kode Recovery"}
            </button>

            <div>
              Terjadi masalah?{" "}
              <Button
                variant="link"
                className="h-auto p-0 cursor-pointer text-indigo-600 hover:text-indigo-500"
                onClick={() => {
                  authStorage.clearToken();
                  navigate("/login");
                }}
              >
                Kembali ke Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtpPage;
