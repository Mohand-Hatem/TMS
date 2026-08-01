"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  projectSchema,
  ProjectFormValues,
} from "@/validation/project.validation";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import { Project } from "@/types/project";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconFolderPlus } from "@tabler/icons-react";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectToEdit?: Project | null;
}

export function ProjectDialog({
  open,
  onOpenChange,
  projectToEdit,
}: ProjectDialogProps) {
  const isEditMode = !!projectToEdit;
  const projectId = projectToEdit?._id || projectToEdit?.id || "";

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject(projectId);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (projectToEdit) {
        form.reset({
          name: projectToEdit.name || "",
          description: projectToEdit.description || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [open, projectToEdit, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: ProjectFormValues) => {
    if (isEditMode) {
      updateMutation.mutate(
        { name: values.name, description: values.description },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        },
      );
    } else {
      createMutation.mutate(
        { name: values.name, description: values.description },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120 p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <IconFolderPlus className="h-5 w-5 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isEditMode ? "Modify Workspace Record" : "New TMS Workspace"}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {isEditMode ? "Edit Project Details" : "Create New Project"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditMode
              ? "Update the project record name or objective description below."
              : "Spin up a shared project board to coordinate tasks and assignments with your team."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-2"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Project Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Q4 Platform Migration & Security Audit"
                      disabled={isPending}
                      className={
                        fieldState.invalid
                          ? "border-destructive focus-visible:ring-destructive/50"
                          : ""
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Description{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (Optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Summarize the core target and deliverables for this project board..."
                      disabled={isPending}
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <span>{isEditMode ? "Save Changes" : "Create Project"}</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
