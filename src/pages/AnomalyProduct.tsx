import { DashboardLayout } from "@/components/Layout/dashboard-layout";
import ErrorComponent from "@/components/Layout/error";
import Pagination from "@/components/Layout/Pagination";
import TableSkeleton from "@/components/Layout/loading";
import { DataTable } from "@/components/Layout/table-data";
import { useGetProductAnomaly } from "@/hooks/useProduct";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { anomalyProductTable } from "@/tables/table-anomaly-product";

export default function AnomalyProduct() {
  const [page, setPage] = useState(1);
  const limit = 25;
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } =
    useGetProductAnomaly(page, limit);

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(`Success Load  Products`);
    }
    if (isError && isFetchedAfterMount) {
      toast.error("Failed Load  Products");
    }
  }, [isSuccess, isError]);
  return (
    <DashboardLayout>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Products" />}
      {isSuccess && (
        <>
          <DataTable columns={anomalyProductTable} data={data?.data ?? []} />

          <Pagination
            page={page}
            totalPage={data?.meta?.total_page}
            onChange={setPage}
          />
        </>
      )}{" "}
    </DashboardLayout>
  );
}
