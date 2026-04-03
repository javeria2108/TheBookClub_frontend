"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { CreateClubPayloadSchema } from "@/lib/contracts/club.contract";
import { createClub } from "@/lib/clubs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void | Promise<void>;
};

type CreateClubFormValues = z.input<typeof CreateClubPayloadSchema>;

export function CreateClubModal({ open, onOpenChange, onCreated }: Props) {
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClubFormValues>({
    resolver: zodResolver(CreateClubPayloadSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: CreateClubFormValues) => {
    try {
      setServerError("");
      setIsSubmitting(true);

      const payload = CreateClubPayloadSchema.parse(data);
      await createClub(payload);
      await onCreated();
      reset();
      onOpenChange(false);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to create club",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
        <h3 className="text-xl font-semibold">Create Club</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start a new reading community.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="name">Club Name</Label>
            <Input
              id="name"
              placeholder="Sci-Fi Readers"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="What your club is about..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isPublic")} />
            Make this club public
          </label>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Club"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
