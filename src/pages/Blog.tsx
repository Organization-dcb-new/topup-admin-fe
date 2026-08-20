import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/Layout/dashboard-layout";
import HeaderBlog from "@/components/Blog/Header/Header";
import BlogList from "@/components/Blog/List/List";
import ManageBlog from "@/components/Blog/Manage/Manage";
import type { Blog } from "@/tables/table-blog";
import { BookOpen } from "lucide-react";

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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="nb-frame nb-frame-thick nb-sd flex gap-3 bg-white p-4 sm:p-5">
          <span className="nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 shrink-0 items-center justify-center bg-[#6fe3f5]">
            <BookOpen className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </span>
          <div className="min-w-0 space-y-1.5">
            <h1 className="text-2xl font-black uppercase leading-none tracking-tight">
              {t("blogPage.title")}
            </h1>
            <p className="text-xs font-bold leading-relaxed text-[#111]/60">
              {t("blogPage.subtitle")}
            </p>
          </div>
        </div>

        <div className="nb-frame nb-frame-thick nb-sd bg-white p-3 sm:p-4">
          <HeaderBlog
            setView={(v) => (v === "create" ? handleCreate() : setView(v))}
            view={view}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>

        {view === "list" ? (
          <BlogList onEdit={handleEdit} viewMode={viewMode} />
        ) : (
          <ManageBlog
            setView={setView}
            initialData={selectedBlog}
            isEdit={view === "edit"}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
