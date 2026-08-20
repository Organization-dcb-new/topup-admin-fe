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
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BannerRowActions } from "@/components/Banner/BannerRowActions";

/** Label status di kanan judul halaman. */
function StatusTag({
  accent,
  children,
}: {
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "nb-frame nb-frame-thin nb-sd-sm inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.12em]",
        accent,
      )}
    >
      {children}
    </p>
  );
}

function ViewToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "nb-frame nb-frame-thin nb-press-sm flex h-9 w-9 cursor-pointer items-center justify-center",
        active ? "nb-sd-sm bg-[#6fe3f5]" : "bg-white text-[#111]/45",
      )}
    >
      {children}
    </button>
  );
}

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
    <div className="nb-frame nb-frame-thick nb-sd nb-press group relative flex flex-col bg-white">
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative aspect-video w-full cursor-zoom-in overflow-hidden border-b-4 border-[#111] bg-[#f5f1e8]">
            <img
              src={src}
              alt="Banner preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png";
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-[#111]/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="nb-frame nb-frame-thin flex h-10 w-10 items-center justify-center bg-[#c9f24d]">
                <ZoomIn className="h-5 w-5" strokeWidth={3} />
              </span>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent
          className="nb nb-frame nb-frame-thick nb-sd-lg max-w-3xl bg-white p-2"
          showCloseButton={false}
        >
          <img
            src={src}
            alt="Banner full size"
            className="h-auto max-h-[80vh] w-full object-contain"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png";
            }}
          />
          <DialogClose asChild>
            <button
              type="button"
              className="nb-frame nb-frame-thin nb-sd-sm nb-press-sm absolute -right-3 -top-3 flex h-9 w-9 cursor-pointer items-center justify-center bg-[#ff4d3d]"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={3} aria-hidden />
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-2.5 p-3">
        {banner.redirect_link ? (
          <div className="flex w-full items-center gap-2">
            <a
              href={banner.redirect_link}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className={cn(
                "nb-frame nb-frame-thin nb-press-sm inline-flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-wide",
                isExternal ? "bg-[#6fe3f5]" : "bg-[#ff9ed2]",
              )}
              title={banner.redirect_link}
            >
              {isExternal ? (
                <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
              ) : (
                <Link2 className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
              )}
              <span className="truncate">{banner.redirect_link}</span>
            </a>
            <button
              type="button"
              className={cn(
                "nb-frame nb-frame-thin nb-press-sm flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center",
                copied ? "bg-[#c9f24d]" : "bg-white",
              )}
              onClick={handleCopy}
              title="Copy Link"
              aria-label="Copy Link"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                <Copy className="h-3.5 w-3.5" strokeWidth={3} />
              )}
            </button>
          </div>
        ) : (
          <span className="nb-frame nb-frame-thin inline-block w-fit bg-[#f5f1e8] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#111]/55">
            No redirect link
          </span>
        )}

        <div className="flex items-center justify-end border-t-4 border-[#111] pt-2.5">
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
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="nb-frame nb-frame-thick nb-sd flex flex-col gap-4 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex gap-3">
            <span className="nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 shrink-0 items-center justify-center bg-[#ff9ed2]">
              <ImageIcon className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </span>
            <div className="min-w-0 space-y-1.5">
              <h1 className="text-2xl font-black uppercase leading-none tracking-tight">
                {t("bannerPage.title")}
              </h1>
              <p className="inline-block bg-[#ffd84d] px-1.5 py-0.5 text-xs font-bold">
                {t("bannerPage.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 sm:justify-end">
            {isPending && (
              <StatusTag accent="bg-[#6fe3f5]">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={3} aria-hidden />
                {t("bannerPage.loadingShort")}
              </StatusTag>
            )}
            {isError && (
              <StatusTag accent="bg-[#ff4d3d]">
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden />
                {t("bannerPage.loadFailedShort")}
              </StatusTag>
            )}
            {isSuccess && (
              <StatusTag accent="bg-[#c9f24d]">
                <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden />
                <span className="tabular-nums">
                  {t("bannerPage.totalBanners", { count: rows.length })}
                </span>
              </StatusTag>
            )}
          </div>
        </div>

        <div className="nb-frame nb-frame-thick nb-sd flex flex-col gap-3 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="min-w-0">
            <h2 className="text-sm font-black uppercase tracking-tight">
              {t("bannerPage.listTitle")}
            </h2>
            <p className="mt-0.5 text-xs font-bold text-[#111]/55">
              {t("bannerPage.listHint")}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="flex items-center gap-1.5">
              <ViewToggleButton
                active={viewMode === "table"}
                onClick={() => setViewMode("table")}
                label="Table View"
              >
                <List className="h-4 w-4" strokeWidth={3} />
              </ViewToggleButton>
              <ViewToggleButton
                active={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                label="Grid Gallery"
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={3} />
              </ViewToggleButton>
            </div>
            <CreateBannerModal />
          </div>
        </div>

        {isPending && (
          <div
            className="nb-frame nb-frame-thick nb-sd flex min-h-[16rem] flex-col items-center justify-center gap-4 bg-white py-12"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#6fe3f5]">
              <Loader2 className="h-7 w-7 animate-spin" strokeWidth={3} aria-hidden />
            </span>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-tight">
                {t("bannerPage.tableLoadingTitle")}
              </p>
              <p className="mt-1 text-xs font-bold text-[#111]/55">
                {t("bannerPage.tableLoadingHint")}
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className="nb-frame nb-frame-thick nb-sd bg-white">
            <ErrorComponent message={t("bannerPage.loadErrorDetail")} />
          </div>
        )}

        {isSuccess &&
          (viewMode === "table" ? (
            <DataTable
              className="nb nb-table nb-sd"
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
              className="nb-frame nb-frame-thick nb-sd flex min-h-[14rem] flex-col items-center justify-center gap-3 bg-white px-6 py-12 text-center"
              role="status"
            >
              <span className="nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#ffd84d]">
                <ImageIcon className="h-6 w-6" strokeWidth={2.5} aria-hidden />
              </span>
              <p className="text-sm font-black uppercase tracking-tight">
                {t("bannerPage.emptyPage")}
              </p>
            </div>
          ))}
      </div>
    </DashboardLayout>
  );
}
