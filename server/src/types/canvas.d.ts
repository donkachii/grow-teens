export type CanvasCourse = {
  id: number;
  name: string;
  public_description?: string;
  [key: string]: unknown;
};
export type CanvasEnrollment = {
  user: { id: number; login_id?: string; email?: string };
  enrollment_state: string;
};

export type CanvasModule = {
  id: number;
  name: string;
  position: number;
  items_count: number;
  [key: string]: unknown;
};

export type CanvasModuleItem = {
  id: number;
  title: string;
  position: number;
  type: string; // "Page" | "File" | "Assignment" | "Quiz" | "ExternalUrl" | "ExternalTool" | "SubHeader" | "Discussion"
  page_url?: string;
  external_url?: string;
  content_id?: number;
  [key: string]: unknown;
};

export type CanvasQuiz = {
  id: number;
  title: string;
  description?: string;
  time_limit?: number;
  allowed_attempts: number;
  scoring_policy?: string;
  shuffle_answers: boolean;
  show_correct_answers: boolean;
  assignment_id?: number;
  assignment_group_id?: number;
  [key: string]: unknown;
};

export type CanvasQuizQuestion = {
  id: number;
  question_name: string;
  question_text: string;
  question_type: string;
  points_possible: number;
  position: number;
  answers?: {
    id: number;
    text: string;
    weight: number;
    [key: string]: unknown;
  }[];
  correct_comments?: string;
  [key: string]: unknown;
};

export type CanvasAssignment = {
  id: number;
  name: string;
  description?: string;
  points_possible: number;
  due_at?: string;
  submission_types: string[];
  course_id: number;
  [key: string]: unknown;
};
