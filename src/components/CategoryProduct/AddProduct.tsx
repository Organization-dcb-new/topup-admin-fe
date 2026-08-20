import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ProductResponseOnly,
  useAddProductToCategoryProduct,
} from "@/hooks/useCategoryProduct";
import { useGetProductNames } from "@/hooks/useProduct";
import { cn } from "@/lib/utils";
import { nbIconBtnSm } from "@/styles/nb";
import {
  ArrowUpDown,
  CheckSquare,
  Loader2,
  Plus,
  Search,
  Square,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type ProductName = {
  id: string;
  name: string;
  provider_status: string;
  price: number;
};

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export function AddProductToCategoryProductButton({
  id,
  game_id,
  existingProduct,
  triggerClassName,
}: {
  id: string;
  game_id: string;
  existingProduct: ProductResponseOnly[];
  triggerClassName?: string;
}) {
  const { t } = useTranslation("common");
  const [selected, setSelected] = useState<string[]>([]);
  const { data: products, isPending, isError } = useGetProductNames(game_id);
  const mutation = useAddProductToCategoryProduct(id);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "provider_status" | "price";
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });

  const toggle = (productId: string) => {
    setSelected((prev) =>
      prev.includes(productId)
        ? prev.filter((x) => x !== productId)
        : [...prev, productId],
    );
  };

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let result = products.filter((p: ProductName) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    result.sort((a: ProductName, b: ProductName) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchQuery, sortConfig]);

  const handleSelectAll = () => {
    if (!filteredAndSortedProducts.length) return;
    const allFilteredIds = filteredAndSortedProducts.map((p: any) => p.id);
    setSelected((prev) => {
      const otherSelected = prev.filter((id) => !allFilteredIds.includes(id));
      return [...otherSelected, ...allFilteredIds];
    });
  };

  const handleDeselectAll = () => {
    if (!filteredAndSortedProducts.length) return;
    const allFilteredIds = filteredAndSortedProducts.map((p : any) => p.id);
    setSelected((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
  };

  const toggleSort = (key: "name" | "provider_status" | "price") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSubmit = () => {
    mutation.mutate(selected);
  };

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (open && existingProduct) {
          setSelected(existingProduct.map((p) => p.id));
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={cn(nbIconBtnSm, triggerClassName)}
          aria-label={t("categoryProductAddProducts.triggerAria")}
        >
          <Plus className="h-4 w-4" strokeWidth={3} aria-hidden />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-[2rem] sm:max-w-[500px] border-none shadow-2xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("categoryProductAddProducts.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("categoryProductAddProducts.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder={t("categoryProductAddProducts.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-sm rounded-xl border-border/50 bg-muted/20 focus-visible:ring-primary/20"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`h-10 px-3 rounded-xl text-xs gap-2 font-medium border-border/50 hover:bg-muted/50 transition-all whitespace-nowrap ${
                sortConfig.key === "name" ? "bg-primary/10 border-primary/30" : ""
              }`}
              onClick={() => toggleSort("name")}
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              {t("categoryProductAddProducts.sortName")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`h-10 px-3 rounded-xl text-xs gap-2 font-medium border-border/50 hover:bg-muted/50 transition-all whitespace-nowrap ${
                sortConfig.key === "price" ? "bg-primary/10 border-primary/30" : ""
              }`}
              onClick={() => toggleSort("price")}
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              {t("categoryProductAddProducts.sortPrice")}
            </Button>
          </div>

          <div className="flex items-center justify-between px-1 py-1 bg-muted/30 rounded-lg border border-border/40">
            <div className="flex items-center gap-2 pl-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider whitespace-nowrap">
                {selected.length} {t("categoryProductAddProducts.selected")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[11px] gap-1.5 font-semibold hover:bg-primary/10 hover:text-primary transition-all rounded-md"
                onClick={handleSelectAll}
              >
                <CheckSquare className="h-3.5 w-3.5" />
                {t("categoryProductAddProducts.selectAll")}
              </Button>
              <div className="h-4 w-px bg-border/60 mx-0.5" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[11px] gap-1.5 font-semibold hover:bg-destructive/10 hover:text-destructive transition-all rounded-md"
                onClick={handleDeselectAll}
              >
                <Square className="h-3.5 w-3.5" />
                {t("categoryProductAddProducts.deselectAll")}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-xl border border-border/50 bg-muted/5 p-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
          {isPending ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2
                className="h-8 w-8 animate-spin text-primary/60"
                aria-hidden
              />
              <p className="text-sm font-medium animate-pulse">
                {t("categoryProductAddProducts.loading")}
              </p>
            </div>
          ) : isError ? (
            <div className="py-16 text-center space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Plus className="h-6 w-6 rotate-45" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-destructive">
                  {t("categoryProductAddProducts.loadError")}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs hover:bg-destructive/5"
                  onClick={() => window.location.reload()}
                >
                  {t("categoryProductAddProducts.retry")}
                </Button>
              </div>
            </div>
          ) : !filteredAndSortedProducts.length ? (
            <div className="py-16 text-center flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground font-medium px-4">
                {searchQuery
                  ? t("categoryProductAddProducts.noMatch")
                  : t("categoryProductAddProducts.empty")}
              </p>
            </div>
          ) : (
            filteredAndSortedProducts.map((product: ProductName) => {
              const checkboxId = `cat-prod-${id}-${product.id}`;
              const isSelected = selected.includes(product.id);
              const isEmpty = product.provider_status === "empty";

              return (
                <div
                  key={product.id}
                  className={`relative flex items-center rounded-xl transition-all duration-200 border ${
                    isSelected
                      ? "bg-primary/[0.03] border-primary/20 shadow-sm shadow-primary/5"
                      : "hover:bg-muted/50 border-transparent hover:border-border/50"
                  }`}
                >
                  <div className="flex items-center w-full px-3 py-3">
                    <Checkbox
                      id={checkboxId}
                      checked={isSelected}
                      onCheckedChange={() => toggle(product.id)}
                      className="mr-3 h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-md"
                    />
                    <Label
                      htmlFor={checkboxId}
                      className="flex flex-1 items-center justify-between min-w-0 cursor-pointer gap-2"
                    >
                      <span
                        className={`text-sm transition-all truncate ${
                          isSelected
                            ? "font-bold text-foreground"
                            : "font-medium text-foreground/80"
                        }`}
                      >
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                          {formatIDR(product.price)}
                        </span>
                        <Badge
                          variant={isEmpty ? "destructive" : "success"}
                          className={`uppercase text-[9px] font-black px-2 py-0.5 tracking-tighter ${
                            isEmpty ? "animate-pulse" : ""
                          }`}
                        >
                          {product.provider_status}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer rounded-xl">
            {t("categoryProductAddProducts.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={
              !selected.length || mutation.isPending || isPending || isError
            }
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl"
          >
            {mutation.isPending ? (
              <>
                <Loader2
                  className="h-4 w-4 shrink-0 animate-spin"
                  aria-hidden
                />
                {t("categoryProductAddProducts.saving")}
              </>
            ) : (
              t("categoryProductAddProducts.save")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
