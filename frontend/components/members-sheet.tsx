'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMemberSchema, AddMemberFormValues } from '@/validation/project.validation';
import { useAddProjectMember, useRemoveProjectMember } from '@/hooks/use-projects';
import { Project, ProjectMember } from '@/types/project';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  IconUsers,
  IconUserPlus,
  IconTrash,
  IconLoader2,
  IconShieldCheck,
  IconAlertCircle,
} from '@tabler/icons-react';

interface MembersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  currentUserId?: string;
}

/**
 * Admin-Only Project Membership Management Sheet.
 * Allows Workspace Admins to add new team members by User ID and revoke membership.
 */
export function MembersSheet({ open, onOpenChange, project, currentUserId }: MembersSheetProps) {
  const projectId = project._id || project.id || '';
  const ownerObj = typeof project.owner === 'object' ? (project.owner as ProjectMember) : null;
  const ownerId = ownerObj?._id || ownerObj?.id || (typeof project.owner === 'string' ? project.owner : '');

  const addMutation = useAddProjectMember(projectId);
  const removeMutation = useRemoveProjectMember(projectId);

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      userId: '',
    },
  });

  const onSubmit = (values: AddMemberFormValues) => {
    addMutation.mutate(
      { userId: values.userId },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  const handleRemoveMember = (targetUserId: string) => {
    if (!targetUserId) return;
    removeMutation.mutate(targetUserId);
  };

  const getInitials = (name?: string, email?: string) => {
    const source = name || email || 'M';
    return source
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const membersList = (project.members || []).map((m) =>
    typeof m === 'object' ? (m as ProjectMember) : { _id: m as string, name: 'Member', email: '' }
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-6 flex flex-col h-full bg-card overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <IconUsers className="h-5 w-5 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider">Team Administration</span>
          </div>
          <SheetTitle className="text-xl font-bold tracking-tight">Project Roster</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Manage authorized team contributors for <strong className="text-foreground">{project.name}</strong>. Only assigned members can collaborate on this board.
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-5" />

        {/* SECTION 1: ADD MEMBER FORM */}
        <div className="space-y-3 rounded-lg bg-muted/50 p-4 border border-border/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <IconUserPlus className="h-4 w-4 text-primary" />
            <span>Add Member by User ID</span>
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Enter the verified MongoDB User ID of a teammate to authorize them on this project board.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pt-1" noValidate>
              <FormField
                control={form.control}
                name="userId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="sr-only">User ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 6549a1b2c3d4e5f60718293a"
                        disabled={addMutation.isPending}
                        className={`bg-background ${fieldState.invalid ? 'border-destructive' : ''}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-medium shadow-2xs" disabled={addMutation.isPending}>
                {addMutation.isPending ? (
                  <>
                    <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                    Authorizing...
                  </>
                ) : (
                  'Authorize Teammate'
                )}
              </Button>
            </form>
          </Form>
        </div>

        <Separator className="my-5" />

        {/* SECTION 2: CURRENT ROSTER DIRECTORY */}
        <div className="flex-1 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Authorized Teammates ({membersList.length})
            </h3>
          </div>

          <div className="space-y-2.5 pt-1">
            {membersList.map((member) => {
              const memId = member._id || member.id || '';
              const isProjectOwner = memId && ownerId && memId === ownerId;
              const isSelf = currentUserId && memId === currentUserId;

              return (
                <div
                  key={memId || member.email}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar className="h-8 w-8 rounded-full border border-border">
                      <AvatarFallback className="text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {getInitials(member.name, member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {member.name} {isSelf && <span className="text-muted-foreground text-xs font-normal">(You)</span>}
                        </span>
                        {isProjectOwner && (
                          <span title="Project Owner & Lead" className="text-indigo-600 dark:text-indigo-400">
                            <IconShieldCheck className="h-4 w-4 shrink-0" />
                          </span>
                        )}
                      </div>
                      <span className="truncate text-xs text-muted-foreground">{member.email || `ID: ${memId}`}</span>
                    </div>
                  </div>

                  <div>
                    {isProjectOwner ? (
                      <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase px-2 py-1 rounded bg-muted">
                        Lead
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(memId)}
                        disabled={removeMutation.isPending}
                        title="Revoke project membership"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <IconTrash className="h-4 w-4" />
                        <span className="sr-only">Remove Member</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {membersList.length === 1 && (
            <div className="flex items-center gap-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 p-3 text-xs text-muted-foreground border border-indigo-200/50 dark:border-indigo-800/40 mt-2">
              <IconAlertCircle className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>Only the Project Lead is currently authorized on this project board. Add teammates above to collaborate.</span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
