import { DashboardLayout } from "@/components/Layout/dashboard-layout";
import ErrorComponent from "@/components/Layout/error";
import Pagination from "@/components/Layout/Pagination";
import TableSkeleton from "@/components/Layout/loading";
import { DataTable } from "@/components/Layout/table-data";
import { useGetProducts } from "@/hooks/useProduct";
import { productColumns } from "@/tables/table-product";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductsSearchInput from "@/components/Product/Filter/SearchProduct";
import { useDebounce } from "@/hooks/useDebounce";
import { ChangeImageByGame } from "@/components/Product/Filter/ChangeImage";
import { Input } from "@/components/ui/input";
import { useGetGameNames } from "@/hooks/useGame";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductPage() {
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [sku, setSku] = useState("");
  const [gameName, setGameName] = useState("");
  const [open, setOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const debouncedSku = useDebounce(sku, 500);
  const [page, setPage] = useState(1);
  const limit = 25;
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } =
    useGetProducts(page, limit, search, isActive, debouncedSku, gameName);

  const { data: gameNamesData } = useGetGameNames();
  console.log(gameNamesData);

  const selectedGameLabel = gameNamesData?.find(
    (game: any) => game.name === gameName,
  )?.name;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, debouncedSku, gameName, isActive]);

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
      <div className="mb-4 flex justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <ProductsSearchInput
            search={search}
            isActive={isActive}
            onSearchChange={setSearch}
            onActiveChange={setIsActive}
          />
          <Input
            placeholder="Search SKU..."
            className="w-45 h-10"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-55 h-10 justify-between font-normal"
              >
                <span className="truncate">
                  {selectedGameLabel || "Select Game..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-55 p-0">
              <Command>
                <CommandInput placeholder="Search game..." />
                <CommandList>
                  <CommandEmpty>No game found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        setGameName("");
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          gameName === "" ? "opacity-100" : "opacity-0",
                        )}
                      />
                      All Games
                    </CommandItem>
                    {gameNamesData?.map((game: any) => (
                      <CommandItem
                        key={game.id}
                        value={game.name}
                        onSelect={() => {
                          setGameName(game.name);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            gameName === game.name
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {game.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <ChangeImageByGame />
      </div>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message="Failed to load Products" />}
      {isSuccess && (
        <>
          <DataTable columns={productColumns} data={data?.data ?? []} />

          {/* Pagination */}
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
