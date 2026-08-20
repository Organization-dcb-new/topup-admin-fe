import { BannerImage } from "@/components/Banner/BannerImage";
import { BannerLink } from "@/components/Banner/BannerLink";
import { BannerRowActions } from "@/components/Banner/BannerRowActions";
import { CreateBannerModal } from "@/components/Banner/CreateBannerModal";
import { DashboardLayout } from "@/components/Layout/dashboard-layout";
import ErrorComponent from "@/components/Layout/error";
import { DataTable } from "@/components/Layout/table-data";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetBanners } from "@/hooks/useBanner";
import { cn } from "@/lib/utils";
import { getBannerColumns } from "@/tables/table-banner";
import type { Banner } from "@/types/banner";
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  LayoutGrid,
  List,
  Loader2,
  X,
  ZoomIn,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type ViewMode = "table" | "grid";

const VIEW_MODE_STORAGE_KEY = "banner-view-mode";

function readStoredViewMode(): ViewMode {
  return localStorage.getItem(VIEW_MODE_STORAGE_KEY) === "table"
    ? "table"
    : "grid";
}

/** Label status di sisi kanan judul halaman. */
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
        active ? "nb-sd-sm bg-[#6fe3f5]" : "bg-white text-[#111]/70",
      )}
    >
      {children}
    </button>
  );
}

function BannerCard({ banner }: { banner: Banner }) {
  const { t } = useTranslation("common");

  return (
    <div className="nb-frame nb-frame-thick nb-sd nb-press group relative flex flex-col bg-white">
      <Dialog>
        <DialogTrigger asChild>
          {/* <button>, bukan <div>: pemicu lama tidak fokusabel sehingga zoom
              gambar sama sekali tidak bisa dibuka lewat keyboard. */}
          <button
            type="button"
            aria-label={t("bannerTable.zoomImage")}
            className="relative block aspect-video w-full cursor-zoom-in overflow-hidden border-b-4 border-[#111] bg-[#f5f1e8]"
          >
            <BannerImage
              src={banner.image}
              alt={t("bannerTable.imageAlt")}
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-[#111]/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="nb-frame nb-frame-thin flex h-10 w-10 items-center justify-center bg-[#c9f24d]">
                <ZoomIn className="h-5 w-5" strokeWidth={3} aria-hidden />
              </span>
            </span>
          </button>
        </DialogTrigger>
        <DialogContent
          className="nb nb-frame nb-frame-thick nb-sd-lg max-w-3xl bg-white p-2"
          showCloseButton={false}
        >
          <BannerImage
            src={banner.image}
            alt={t("bannerTable.imageAlt")}
            className="h-auto max-h-[80vh] w-full object-contain"
            fallbackClassName="min-h-[16rem]"
          />
          <DialogClose asChild>
            <button
              type="button"
              className="nb-frame nb-frame-thin nb-sd-sm nb-press-sm absolute -right-3 -top-3 flex h-9 w-9 cursor-pointer items-center justify-center bg-[#ff4d3d]"
              aria-label={t("bannerTable.closePreview")}
            >
              <X className="h-4 w-4" strokeWidth={3} aria-hidden />
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-2.5 p-3">
        <BannerLink url={banner.redirect_link} />

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
  const [viewMode, setViewMode] = useState<ViewMode>(readStoredViewMode);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

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
                <Loader2
                  className="h-4 w-4 shrink-0 animate-spin"
                  strokeWidth={3}
                  aria-hidden
                />
                {t("bannerPage.loadingShort")}
              </StatusTag>
            )}
            {isError && (
              <StatusTag accent="bg-[#ff4d3d]">
                <AlertCircle
                  className="h-4 w-4 shrink-0"
                  strokeWidth={3}
                  aria-hidden
                />
                {t("bannerPage.loadFailedShort")}
              </StatusTag>
            )}
            {isSuccess && (
              <StatusTag accent="bg-[#c9f24d]">
                <CheckCircle2
                  className="h-4 w-4 shrink-0"
                  strokeWidth={3}
                  aria-hidden
                />
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
            <p className="mt-0.5 text-xs font-bold text-[#111]/70">
              {t("bannerPage.listHint")}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="flex items-center gap-1.5">
              <ViewToggleButton
                active={viewMode === "table"}
                onClick={() => setViewMode("table")}
                label={t("bannerPage.tableView")}
              >
                <List className="h-4 w-4" strokeWidth={3} aria-hidden />
              </ViewToggleButton>
              <ViewToggleButton
                active={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                label={t("bannerPage.gridView")}
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={3} aria-hidden />
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
              <Loader2
                className="h-7 w-7 animate-spin"
                strokeWidth={3}
                aria-hidden
              />
            </span>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-tight">
                {t("bannerPage.tableLoadingTitle")}
              </p>
              <p className="mt-1 text-xs font-bold text-[#111]/70">
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
