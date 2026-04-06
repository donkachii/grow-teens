import requestClient from '@/lib/requestClient';

export type CanvasConfig = {
  configured: boolean;
  id?: number;
  domain?: string;
  accountId?: string;
  isActive?: boolean;
  updatedAt?: string;
};

export type CanvasCourse = {
  id: number;
  name: string;
  course_code: string;
  public_description?: string;
  workflow_state: string;
  total_students?: number;
  growTeensCourse?: { id: number; title: string; canvasId: string } | null;
};

export type SyncLog = {
  id: number;
  operation: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  details?: string;
  error?: string;
  recordCount?: number;
  createdAt: string;
  completedAt?: string;
};

export const canvasService = {
  getConfig: (token: string): Promise<CanvasConfig> =>
    requestClient({ token }).get('/canvas/config'),

  saveConfig: (
    token: string,
    data: { domain: string; apiToken: string; accountId?: string }
  ): Promise<{ message: string; domain: string; accountId: string }> =>
    requestClient({ token }).post('/canvas/config', data),

  getCanvasCourses: (token: string, params: { page?: number; per_page?: number } = {}): Promise<{ data: CanvasCourse[] }> =>
    requestClient({ token }).get('/canvas/courses', { params }),

  importCourses: (
    token: string,
    data: { courseIds?: number[] } = {}
  ): Promise<{ message: string; imported: number; updated: number }> =>
    requestClient({ token }).post('/canvas/sync/import', data),

  pushCourse: (
    token: string,
    courseId: number | string
  ): Promise<{ message: string; canvasCourseId: number }> =>
    requestClient({ token }).post(`/canvas/sync/push/${courseId}`),

  syncEnrollments: (
    token: string,
    courseId: number | string
  ): Promise<{ message: string; synced: number; skipped: number }> =>
    requestClient({ token }).post(`/canvas/sync/enrollments/${courseId}`),

  getSyncLogs: (
    token: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ data: SyncLog[]; pagination: { total: number; page: number; limit: number } }> =>
    requestClient({ token }).get('/canvas/sync/logs', { params }),
};
