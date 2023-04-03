export interface Session {
  description: string | null;
  id: string;
  in: string | null;
  out: string | null;
  taskID: string;
  projectID: string;
}

export interface Task {
  id: string;
  projectID: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface PromptSuccessResponse<T> {
  success: true;
  data: T;
}

export interface PromptErrorResponse {
  success: false;
  error: string;
}
