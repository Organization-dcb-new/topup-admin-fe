import { CreateBannerModal } from "@/components/Banner/CreateBannerModal";
import { DashboardLayout } from "@/components/Layout/dashboard-layout";
import ErrorComponent from "@/components/Layout/error";
import { DataTable } from "@/components/Layout/table-data";
import { useGetBanners } from "@/hooks/useBanner";
import { getBannerColumns } from "@/tables/table-banner";
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Loader2,
  LayoutGrid,
  List,
  ZoomIn,
  ExternalLink,
  Link2,
  Copy,
  Check,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BannerRowActions } from "@/components/Banner/BannerRowActions";
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

function BannerCard({ banner }: { banner: any }) {
  const [copied, setCopied] = useState(false);
  const isExternal =
    banner.redirect_link?.startsWith("http://") ||
    banner.redirect_link?.startsWith("https://");

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!banner.redirect_link) return;
    await navigator.clipboard.writeText(banner.redirect_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const src = banner.image || "https://api.dicebear.com/9.x/lorelei/svg";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700">
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative cursor-zoom-in aspect-video w-full overflow-hidden bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
            <img
              src={src}
              alt="Banner preview"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png";
              }}
            />
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs border border-white/30 text-white">
                <ZoomIn className="h-5 w-5" />
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-3xl p-1 bg-transparent border-none shadow-none focus:outline-hidden">
          <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2">
            <img
              src={src}
              alt="Banner full size"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png";
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-2.5 p-4">
        {banner.redirect_link ? (
          <div className="flex items-center justify-between gap-2 w-full">
            <a
              href={banner.redirect_link}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all duration-200 max-w-[80%] truncate",
                isExternal
                  ? "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  : "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/40",
              )}
              title={banner.redirect_link}
            >
              {isExternal ? (
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Link2 className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">{banner.redirect_link}</span>
            </a>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
              onClick={handleCopy}
              title="Copy Link"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              )}
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic py-1">
            No redirect link
          </span>
        )}

        <div className="flex items-center justify-end border-t border-slate-100 dark:border-zinc-900 pt-2.5 mt-1.5">
          <BannerRowActions banner={banner} />
        </div>
      </div>
    </div>
  );
}

export default function BannerPage() {
  const { t } = useTranslation("common");
  const { data, isPending, isError, isSuccess } = useGetBanners();
  const rows = data?.data ?? [];
  const bannerColumns = useMemo(() => getBannerColumns(t), [t]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ImageIcon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {t("bannerPage.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("bannerPage.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 sm:text-right">
            {isPending && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Loader2
                  className="h-4 w-4 shrink-0 animate-spin text-primary"
                  aria-hidden
                />
                {t("bannerPage.loadingShort")}
              </p>
            )}
            {isError && (
              <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                {t("bannerPage.loadFailedShort")}
              </p>
            )}
            {isSuccess && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden
                />
                <span className="tabular-nums text-foreground dark:text-slate-300">
                  {t("bannerPage.totalBanners", { count: rows.length })}
                </span>
              </p>
            )}
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            viewMode === "table"
              ? "rounded-xl bg-white dark:bg-zinc-950 shadow-xs ring-1 ring-gray-200 dark:ring-zinc-800"
              : "rounded-none bg-transparent shadow-none ring-0",
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 sm:px-5",
              viewMode === "table"
                ? "border-b border-slate-100 dark:border-zinc-900"
                : "mb-5! px-0! py-0!",
            )}
          >
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("bannerPage.listTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("bannerPage.listHint")}
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "h-7 w-7 rounded-md transition-all duration-200 cursor-pointer",
                    viewMode === "table"
                      ? "bg-white dark:bg-zinc-800 text-foreground dark:text-white shadow-xs"
                      : "text-slate-400 dark:text-slate-500",
                  )}
                  title="Table View"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-7 w-7 rounded-md transition-all duration-200 cursor-pointer",
                    viewMode === "grid"
                      ? "bg-white dark:bg-zinc-800 text-foreground dark:text-white shadow-xs"
                      : "text-slate-400 dark:text-slate-500",
                  )}
                  title="Grid Gallery"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <Can perm={PERM.BANNER_CREATE}>
                <CreateBannerModal />
              </Can>
            </div>
          </div>

          <div
            className={cn(viewMode === "table" ? "p-4 sm:p-5" : "py-2 px-0")}
          >
            {isPending && (
              <div
                className="flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2
                  className="h-11 w-11 animate-spin text-primary"
                  aria-hidden
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {t("bannerPage.tableLoadingTitle")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("bannerPage.tableLoadingHint")}
                  </p>
                </div>
              </div>
            )}

            {isError && (
              <ErrorComponent message={t("bannerPage.loadErrorDetail")} />
            )}

            {isSuccess &&
              (viewMode === "table" ? (
                <DataTable
                  columns={bannerColumns}
                  data={rows}
                  emptyMessage={t("bannerPage.emptyPage")}
                />
              ) : rows.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rows.map((banner) => (
                    <BannerCard key={banner.id} banner={banner} />
                  ))}
                </div>
              ) : (
                <div
                  className="flex min-h-[14rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/10 px-6 py-12 text-center"
                  role="status"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-slate-500">
                    <ImageIcon className="h-6 w-6" aria-hidden />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground dark:text-white">
                      {t("bannerPage.emptyPage")}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
