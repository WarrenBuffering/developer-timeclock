export interface Session {
  description: string | null;
  id: number;
  in: string | null;
  out: string | null;
  projectID: number;
}

export interface Project {
  id: number;
  name: string;
}
