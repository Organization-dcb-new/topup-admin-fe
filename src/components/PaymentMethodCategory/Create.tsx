import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { UploadCloud } from "lucide-react";

import { handleFileAutoUpload } from "@/helpers/upload";

import { useCreatePaymentCategory } from "@/hooks/usePaymentMethodCategory";

export type FormValuesPaymentCategory = {
  name: string;
  slug: string;
  icon_url: string;
};

export type PaymentCategoryPayload = {
  name: string;
  slug: string;
  icon_url: string;
};

export function CreatePaymentCategoryModal() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValuesPaymentCategory>();

  const mutation = useCreatePaymentCategory(reset, setPreview, setOpen);
  const onSubmit = (values: FormValuesPaymentCategory) => {
    mutation.mutate(values);
  };

  const handleFile = (file: File) => {
    handleFileAutoUpload({
      file,
      setPreview,
      setIsUploading,
      setUploadProgress,
      setValue: setValue as any,
      fieldName: "icon_url",
    });
  };

  useEffect(() => {
    if (!open) {
      reset();
      setPreview(null);
      setUploadProgress(0);
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [open, reset]);

  return (
    <>
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        + Create Payment Category
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Payment Category</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>Name</Label>
              <div className="space-y-1">
                <Input
                  {...register("name", {
                    required: "Name is required",
                  })}
                  placeholder="Name"
                  aria-invalid={!!errors.name}
                />

                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>
            {/* Alias */}
            <div className="space-y-2">
              <Label>Slug</Label>
              <div className="space-y-1">
                <Input
                  {...register("slug", {
                    required: "Slug is required",
                  })}
                  placeholder="Slug"
                  aria-invalid={!!errors.slug}
                />

                {errors.slug && (
                  <p className="text-xs text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div className="space-y-2">
              <Label>Icon</Label>

              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
                className={`group relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition
                  ${isUploading ? "pointer-events-none opacity-60" : "hover:border-primary"}
                `}
              >
                {preview ? (
                  <img
                    src={preview}
                    className="h-full w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UploadCloud className="h-6 w-6" />
                    <span className="text-sm">Click or Drop image</span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                    <span className="text-sm">Uploading {uploadProgress}%</span>
                  </div>
                )}
              </div>

              {/* Progress */}
              {isUploading && <Progress value={uploadProgress} />}
            </div>

            {/* Hidden Input */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {/* Save */}
            <DialogFooter>
              <Button
                className="cursor-pointer"
                variant="outline"
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={isUploading || mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
