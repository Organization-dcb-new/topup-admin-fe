import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  ShieldOff,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/api/axios";
import { authStorage } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface SetupData {
  qr_url: string;
  recovery_codes: string[];
}

const Setup2FA = () => {
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    data: profile,
    isLoading: isChecking,
    refetch: reloadProfile,
  } = useQuery({
    queryKey: ["admin-me"],
    queryFn: async () => {
      const res = await api.get("/admin/me");
      return res.data.data;
    },
  });

  const isMfaActive = profile?.two_factor_enabled;

  const { mutate: generateSetup, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      const res = await api.get("/admin/setup-2fa");
      return res.data.data;
    },
    onSuccess: (data) => {
      setSetupData(data);
      toast.success("QR Code generated successfully!");
    },
    onError: () => toast.error("Failed to generate 2FA setup"),
  });

  const { mutate: activateMfa, isPending: isActivating } = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post("/admin/activate", { code });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success("2FA Activated Successfully!");
      if (res.token) authStorage.setToken(res.token);
      setSetupData(null);
      reloadProfile();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Invalid OTP code"),
  });

  const { mutate: deactivateMfa, isPending: isDeactivating } = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post("/admin/deactivate", { code });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success("2FA deactivated successfully");
      if (res.token) authStorage.setToken(res.token);
      setIsConfirmingDeactivate(false);
      reloadProfile();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to deactivate"),
  });

  const handleCopyCodes = () => {
    if (setupData) {
      navigator.clipboard.writeText(setupData.recovery_codes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Backup codes copied!");
    }
  };

  if (isChecking)
    return (
      <div className="p-10 text-center font-mono animate-pulse">
        Checking security status...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 ">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-purple-600 rounded-2xl shadow-sm border border-indigo-100">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Security
            </h1>
            <p className="text-slate-500">
              Manage Two-Factor Authentication for your account.
            </p>
          </div>
        </div>
        {isMfaActive && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            2FA ACTIVE
          </div>
        )}
      </div>

      {isMfaActive ? (
        <Card className="border-red-100 bg-red-50/20 overflow-hidden border-2 shadow-xl shadow-red-900/5">
          <CardHeader className="bg-white border-b border-red-100">
            <CardTitle className="text-red-700 flex items-center gap-2 font-bold">
              <ShieldOff className="w-5 h-5" /> 2FA Management
            </CardTitle>
            <CardDescription className="text-slate-600">
              Your account is currently protected with two-step verification.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center py-12 space-y-8">
            {!isConfirmingDeactivate ? (
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-slate-900">
                    Disable Security Protection?
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    This action will make your account more vulnerable. Please
                    ensure you understand the risks.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => setIsConfirmingDeactivate(true)}
                  className="font-bold px-10 h-12 rounded-xl transition-all active:scale-95"
                >
                  Disable 2FA
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="text-center">
                  <h3 className="font-bold text-lg text-red-800">
                    Final Verification
                  </h3>
                  <p className="text-sm text-slate-500">
                    Enter the OTP code to confirm
                  </p>
                </div>

                <InputOTP
                  maxLength={6}
                  disabled={isDeactivating}
                  onComplete={(v) => deactivateMfa(v)}
                  autoFocus
                >
                  <InputOTPGroup>
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="w-12 h-16 bg-white text-xl font-black border-red-200 focus:border-red-500"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                <div className="flex flex-col items-center gap-3">
                  {isDeactivating ? (
                    <p className="text-sm text-red-600 font-bold animate-pulse italic">
                      Deactivating...
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => setIsConfirmingDeactivate(false)}
                      className="text-slate-400 text-xs hover:text-red-600"
                    >
                      Cancel, Keep 2FA Enabled
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {!setupData ? (
            <Card className="border-dashed border-2 flex flex-col items-center py-20 bg-slate-50/50 shadow-inner">
              <div className="p-4 bg-white rounded-3xl shadow-sm mb-6 border border-slate-100">
                <RefreshCw
                  className={`w-12 h-12 text-purple-400 ${isGenerating ? "animate-spin" : ""}`}
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800 tracking-tight">
                Enhance Account Security
              </h3>
              <p className="text-sm text-slate-500 mb-8 text-center max-w-xs px-4">
                Use an authenticator app to protect your admin dashboard from
                unauthorized access.
              </p>
              <Button
                onClick={() => generateSetup()}
                disabled={isGenerating}
                className="bg-purple-600 cursor-pointer hover:bg-purple-700 font-bold px-10 py-7 text-lg rounded-2xl shadow-lg shadow-purple-200 active:scale-95 transition-all"
              >
                {isGenerating ? "Setting up..." : "Setup 2FA Now"}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Scan Section */}
              <Card className="shadow-md border-none ring-1 ring-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    1. Scan QR
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                  <div className="bg-white p-4 border-2 border-dashed border-slate-100 rounded-3xl shadow-inner">
                    <QRCodeSVG value={setupData.qr_url} size={180} />
                  </div>
                </CardContent>
              </Card>

              {/* Backup Section */}
              <Card className="shadow-md border-none ring-1 ring-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    2. Backup Codes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 py-6">
                  <div className="grid grid-cols-2 gap-2">
                    {setupData.recovery_codes.map((code) => (
                      <div
                        key={code}
                        className="bg-slate-50 p-2 text-center rounded-lg text-[11px] font-mono font-bold border border-slate-100 shadow-sm"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-2 font-bold"
                    onClick={handleCopyCodes}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied" : "Copy All Codes"}
                  </Button>
                </CardContent>
              </Card>

              {/* Activation Section */}
              <Card className="shadow-xl border-indigo-200 ring-4 ring-indigo-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    3. Activate
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 flex flex-col items-center space-y-8">
                  <InputOTP
                    maxLength={6}
                    disabled={isActivating}
                    onComplete={(v) => activateMfa(v)}
                  >
                    <InputOTPGroup>
                      {[...Array(6)].map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="w-10 h-14 text-xl font-bold bg-slate-50 border-indigo-200"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Info Warning */}
      {setupData && !isMfaActive && (
        <Alert className="bg-amber-50 border-amber-200 border-l-4">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <AlertTitle className="font-black text-amber-900">
            Attention Before Activation
          </AlertTitle>
          <AlertDescription className="text-amber-800 text-xs">
            Make sure you have saved your backup codes in a safe place. Without
            these codes, you cannot recover your account if the authenticator
            app is lost.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Setup2FA;
