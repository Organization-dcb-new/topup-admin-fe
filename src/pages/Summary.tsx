import { SummaryFilter } from "@/components/Summary/SummaryFilter";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useState } from "react";
import { useGetSummary } from "@/hooks/useSummary";
import { DashboardLayout } from "@/components/Layout/dashboard-layout";
import TableSkeleton from "@/components/Layout/loading";
import { DataTable } from "@/components/Layout/table-data";
import Pagination from "@/components/Layout/Pagination";
import SummaryCard from "@/components/Summary/Summary";
import { summaryColumns } from "@/tables/table-summary";

export default function SummaryPage() {
  const [page, setPage] = useState(1);
  const [groupBy, setGroupBy] = useState("hour");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
  const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";

  const { data, isLoading, isSuccess } = useGetSummary(
    page,
    10,
    startDate,
    endDate,
    groupBy,
  );

  const handleReset = () => {
    setPage(1);
    setGroupBy("hour");
    setDate(undefined);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <SummaryFilter
          date={date}
          setDate={(d) => {
            setDate(d);
            setPage(1);
          }}
          groupBy={groupBy}
          setGroupBy={(v) => {
            setGroupBy(v);
            setPage(1);
          }}
          onReset={handleReset}
        />

        {isLoading && <TableSkeleton />}

        {isSuccess && data && (
          <>
            <SummaryCard stats={data.data.overall_stats} />

            <DataTable columns={summaryColumns} data={data.data.data ?? []} />
            <Pagination
              page={page}
              totalPage={data.data.meta.total_pages}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
