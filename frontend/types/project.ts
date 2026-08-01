export interface ProjectMember {
  _id: string;
  id?: string;
  name: string;
  email: string;
}

export interface Project {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  owner: string | ProjectMember;
  members: (string | ProjectMember)[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface AddMemberInput {
  userId: string;
}
