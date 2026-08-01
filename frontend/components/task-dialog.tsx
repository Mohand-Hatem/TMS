'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, TaskFormValues } from '@/validation/task.validation';
import { useCreateTask, useUpdateTask } from '@/hooks/use-tasks';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { ProjectMember } from '@/types/project';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { IconLoader2, IconClipboardList, IconCheck } from '@tabler/icons-react';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  taskToEdit?: Task | null;
  projectMembers?: ProjectMember[];
}

export function TaskDialog({ open, onOpenChange, projectId, taskToEdit, projectMembers = [] }: TaskDialogProps) {
  const isEditMode = !!taskToEdit;
  const taskId = taskToEdit?._id || taskToEdit?.id || '';

  const createMutation = useCreateTask(projectId);
  const updateMutation = useUpdateTask(projectId);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      dueDate: '',
      assignee: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (taskToEdit) {
        let assignedVal: string[] = [];
        if (Array.isArray(taskToEdit.assignee)) {
          assignedVal = taskToEdit.assignee.map((a) => typeof a === 'object' && a !== null ? (a as ProjectMember)._id || (a as ProjectMember).id || '' : a as string).filter(Boolean);
        } else if (typeof taskToEdit.assignee === 'object' && taskToEdit.assignee !== null) {
          assignedVal = [(taskToEdit.assignee as ProjectMember)._id || (taskToEdit.assignee as ProjectMember).id || ''].filter(Boolean);
        } else if (typeof taskToEdit.assignee === 'string' && taskToEdit.assignee) {
          assignedVal = [taskToEdit.assignee];
        }

        form.reset({
          title: taskToEdit.title || '',
          description: taskToEdit.description || '',
          status: taskToEdit.status || 'To Do',
          priority: taskToEdit.priority || 'Medium',
          dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.slice(0, 10) : '',
          assignee: assignedVal,
        });
      } else {
        form.reset({
          title: '',
          description: '',
          status: 'To Do',
          priority: 'Medium',
          dueDate: '',
          assignee: [],
        });
      }
    }
  }, [open, taskToEdit, form]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: TaskFormValues) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      status: values.status as TaskStatus,
      priority: values.priority as TaskPriority,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      assignee: Array.isArray(values.assignee) && values.assignee.length > 0
        ? values.assignee
        : typeof values.assignee === 'string' && values.assignee !== ''
        ? [values.assignee]
        : undefined,
    };

    if (isEditMode) {
      updateMutation.mutate(
        { taskId, ...payload },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <IconClipboardList className="h-5 w-5 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isEditMode ? 'Modify Task' : 'New Task'}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {isEditMode ? 'Edit Task Record' : 'Register New Task'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Update specifications, deadline, priority, or assignee for this task entry.'
              : 'Add an actionable task entry to this workspace board and assign a team member.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2" noValidate>
            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Task Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Implement automated JWT token refresh interval"
                      disabled={isPending}
                      className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive/50' : ''}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Initial Status Stamp</FormLabel>
                    <FormControl>
                      <select
                        disabled={isPending}
                        value={field.value}
                        onChange={field.onChange}
                        className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Priority Level</FormLabel>
                    <FormControl>
                      <select
                        disabled={isPending}
                        value={field.value}
                        onChange={field.onChange}
                        className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="col-span-1 sm:col-span-2">
                    <FormLabel className="text-sm font-medium">
                      Target Due Date <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isPending} className="w-full sm:w-1/2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => {
                  const selectedIds = Array.isArray(field.value) ? field.value : field.value ? [field.value] : [];
                  const toggleMember = (memId: string) => {
                    if (selectedIds.includes(memId)) {
                      field.onChange(selectedIds.filter((id) => id !== memId));
                    } else {
                      if (selectedIds.length >= 5) {
                        return; // Max 5 limit enforced
                      }
                      field.onChange([...selectedIds, memId]);
                    }
                  };

                  return (
                    <FormItem className="col-span-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium">
                          Assign Teammates <span className="text-muted-foreground text-xs font-normal">(Max 5 members)</span>
                        </FormLabel>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${selectedIds.length === 5 ? 'bg-rose-500/10 text-rose-500 font-bold' : 'bg-muted text-muted-foreground'}`}>
                          {selectedIds.length} / 5 selected
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 border border-input rounded-lg bg-card/60 max-h-40 overflow-y-auto">
                        {projectMembers.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic p-2 col-span-2 text-center">No teammates available in this project.</p>
                        ) : (
                          projectMembers.map((member) => {
                            const memId = member._id || member.id || '';
                            const isSelected = selectedIds.includes(memId);
                            return (
                              <button
                                key={memId}
                                type="button"
                                disabled={isPending || (!isSelected && selectedIds.length >= 5)}
                                onClick={() => toggleMember(memId)}
                                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium border transition-all ${
                                  isSelected
                                    ? 'bg-primary/10 border-primary/50 text-primary shadow-2xs font-semibold'
                                    : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                } disabled:opacity-50`}
                              >
                                <div className="flex flex-col items-start truncate pe-2">
                                  <span className="truncate font-semibold">{member.name}</span>
                                  <span className="text-[10px] text-muted-foreground/80 truncate">{member.email}</span>
                                </div>
                                <span className={`h-4 w-4 shrink-0 rounded-sm flex items-center justify-center border ${
                                  isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground/40 bg-background'
                                }`}>
                                  {isSelected ? <IconCheck className="h-3 w-3 stroke-[3]" /> : null}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Detailed Notes <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Specify acceptance instructions or relevant technical notes..."
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Registering...'}
                  </>
                ) : (
                  <span>{isEditMode ? 'Save Changes' : 'Create Task'}</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
