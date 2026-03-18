import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/api/axios";

export const CreateAdminModal = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      full_name: "",
      role: "admin",
    },
  });

  const selectedRole = watch("role");

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: any) => {
      return await api.post("/admin/register", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("New admin successfully registered!");
      setOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to register admin");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 rounded-xl shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4" /> Add Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Admin</DialogTitle>
          <DialogDescription>
            Enter account details to grant dashboard access.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((v) => mutate(v))}
          className="space-y-4 pt-4"
        >
          <div className="space-y-2">
            <Label className="font-bold">Full Name</Label>
            <Input
              {...register("full_name", {
                required: "Full name is required",
              })}
              placeholder="e.g. John Doe"
              className="rounded-xl"
            />
            {errors.full_name && (
              <p className="text-xs text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">Username</Label>
              <Input
                {...register("username", { required: "Username is required" })}
                placeholder="johndoe"
                className="rounded-xl"
              />
              {errors.username && (
                <p className="text-xs text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Role</Label>
              <Select
                onValueChange={(val) => setValue("role", val)}
                defaultValue={selectedRole}
              >
                <SelectTrigger className="rounded-xl uppercase font-bold text-xs">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">DEV</SelectItem>
                  <SelectItem value="admin">ADMIN</SelectItem>
                  <SelectItem value="noc">NOC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Email</Label>
            <Input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email format",
                },
              })}
              type="email"
              placeholder="admin@pakargaming.id"
              className="rounded-xl"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Password</Label>
            <Input
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              type="password"
              placeholder="******"
              className="rounded-xl"
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 font-bold mt-4"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              "Register Now"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
