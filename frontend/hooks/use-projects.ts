'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Project, CreateProjectInput, UpdateProjectInput, AddMemberInput } from '@/types/project';
import { projectKeys } from '@/lib/query-keys';
import { toast } from 'sonner';

/**
 * Hook to retrieve all projects for the authenticated user.
 */
export function useProjects() {
  return useQuery<Project[]>({
    queryKey: projectKeys.list(),
    queryFn: async () => {
      const response = await api.get<Project[]>('/projects');
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to retrieve a single project by its ID.
 * 
 * ASSUMPTION FLAG & KEY DECISION:
 * Upon reviewing the backend routing (`project.routes.js`), there is currently NO dedicated GET /api/projects/:id endpoint;
 * only PUT and DELETE are mounted on /:id. To provide atomic single-project data consumption to detail screens without generating
 * 404 errors, this hook fetches the user's project collection via GET /api/projects (or extracts it from TanStack cache) and resolves
 * the corresponding project matching by _id or id.
 */
export function useProject(projectId: string) {
  return useQuery<Project | null>({
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      const response = await api.get<Project[]>('/projects');
      const found = response.data.find((p) => p._id === projectId || p.id === projectId);
      return found || null;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectInput): Promise<Project> => {
      const response = await api.post<Project>('/projects', data);
      return response.data;
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(newProject._id || newProject.id!), newProject);
      toast.success('Project created successfully!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to create project';
      toast.error(msg);
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProjectInput): Promise<Project> => {
      const response = await api.put<Project>(`/projects/${projectId}`, data);
      return response.data;
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(projectId), updatedProject);
      toast.success('Project updated successfully!');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update project';
      toast.error(msg);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(deletedId) });
      toast.success('Project deleted successfully.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete project';
      toast.error(msg);
    },
  });
}

/**
 * Admin-only mutation hook to add a user member to a project.
 */
export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddMemberInput): Promise<Project> => {
      const response = await api.post<Project>(`/projects/${projectId}/members`, data);
      return response.data;
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(projectId), updatedProject);
      toast.success('Member added to project.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to add member';
      toast.error(msg);
    },
  });
}

/**
 * Admin-only mutation hook to remove a user member from a project.
 */
export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<Project> => {
      const response = await api.delete<Project>(`/projects/${projectId}/members/${userId}`);
      return response.data;
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(projectId), updatedProject);
      toast.success('Member removed from project.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to remove member';
      toast.error(msg);
    },
  });
}
