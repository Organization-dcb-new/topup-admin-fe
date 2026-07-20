import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/Layout/dashboard-layout";
import HeaderBlog from "@/components/Blog/Header/Header";
import BlogList from "@/components/Blog/List/List";
import ManageBlog from "@/components/Blog/Manage/Manage";
import type { Blog } from "@/tables/table-blog";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const { t } = useTranslation("common");
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setView("edit");
  };

  const handleCreate = () => {
    setSelectedBlog(null);
    setView("create");
  };

  const isGridMode = view === "list" && viewMode === "grid";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {t("blogPage.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("blogPage.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isGridMode
              ? "rounded-none bg-transparent shadow-none ring-0"
              : "rounded-xl bg-white dark:bg-zinc-950 shadow-xs ring-1 ring-gray-200 dark:ring-zinc-800",
          )}
        >
          <div
            className={cn(
              "px-4 py-4 sm:px-5",
              isGridMode
                ? "px-0! py-0! mb-5!"
                : "border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/10",
            )}
          >
            <HeaderBlog
              className="mb-0"
              setView={(v) => (v === "create" ? handleCreate() : setView(v))}
              view={view}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
          <div className={cn(isGridMode ? "p-0!" : "p-4 sm:p-6")}>
            {view === "list" ? (
              <BlogList
                onEdit={handleEdit}
                viewMode={viewMode}
              />
            ) : (
              <ManageBlog
                setView={setView}
                initialData={selectedBlog}
                isEdit={view === "edit"}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
