import requestClient from '@/lib/requestClient';
import { Course} from '@/types';

// Basic types (refine with actual structure from '@/types' or Prisma)
type User = { id: number; email: string; firstName: string; lastName: string; role: string; /* ... */ };
type Module = { id: number; title: string; courseId: number; /* ... */ };
type ContentUnit = { id: number; title: string; moduleId: number; contentType: string; /* ... */ };
type Enrollment = { id: number; courseId: number; userId: number; progressPercentage: number; course?: Partial<Course>; /* ... */ };

// Input data types
type RegisterUserData = { firstName: string; lastName: string; email: string; password: string; role: string; age?: number; };
type LoginUserData = { email: string; password: string; };
type UnitProgressData = { unitId: number; courseId: number; completed?: boolean; /* ... */ };

// Parameter types for lists
type BaseListParams = { page?: number | string; limit?: number | string; sortBy?: string; order?: 'asc' | 'desc'; };
type UserListParams = BaseListParams & { search?: string; role?: string; status?: string; };
type CourseListParams = BaseListParams & { search?: string; categoryId?: number | string; difficulty?: string; };
export type AdminCourseListParams = CourseListParams & { isPublished?: boolean | string; isFeatured?: boolean | string; };
type ModuleListParams = BaseListParams & { courseId: number | string; };
type ContentUnitListParams = BaseListParams & { moduleId: number | string; };

// Response Types (Define these properly based on your API structure)
type LoginResponse = { user: User; accessToken: string; message: string };
type MessageResponse = { message: string };
type EnrollResponse = { message: string; enrollment: Enrollment };
type TogglePublishResponse = { message: string; course: Course };
type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
  [key: string]: any;
};

// Specific Paginated types based on PaginatedResponse structure
// type AdminPaginatedCourses = PaginatedResponse<Course> & { courses?: Course[] };
// type PaginatedUsers = PaginatedResponse<User> & { users?: User[] };
// type PaginatedCourses = PaginatedResponse<Course> & { courses?: Course[] };

// --- Auth Service ---
export const authService = {
  // No token needed for register/login
  register: (data: RegisterUserData): Promise<MessageResponse> => {
    return requestClient().post('/auth/signup', data);
  },
  login: (data: LoginUserData): Promise<LoginResponse> => {
    return requestClient().post('/auth/signin', data);
  },
  verifyEmail: (token: string): Promise<MessageResponse> => {
    return requestClient().get(`/auth/verify-email/${token}`);
  },
  resendVerification: (data: { email: string }): Promise<MessageResponse> => {
    return requestClient().post('/auth/resend-verification', data);
  },
  // Token required for logout/getCurrentUser
  logout: (token: string): Promise<void> => {
    return requestClient({ token }).post('/auth/logout');
  },
  getCurrentUser: (token: string): Promise<User> => {
    return requestClient({ token }).get('/auth/me');
  },
};

// --- User Service ---
export const userService = {
  updateCurrentUser: (token: string, data: Partial<User>): Promise<User> => {
    return requestClient({ token }).put('/users/me', data);
  },
  getAllUsersAdmin: (token: string, params: UserListParams = {}): Promise<PaginatedResponse<User>> => {
    return requestClient({ token }).get('/users', { params });
  },
  updateUserStatusAdmin: (token: string, userId: number, data: { status: 'active' | 'pending' }): Promise<MessageResponse> => {
    return requestClient({ token }).patch(`/users/${userId}/status`, data);
  },
  updateUserRoleAdmin: (token: string, userId: number, data: { role: string }): Promise<MessageResponse> => {
    return requestClient({ token }).patch(`/users/${userId}/role`, data);
  },
};

// --- Course Service ---
export const courseService = {
  // Public view might not need token, depends on requestClient default setup
  getCourses: (params: CourseListParams = {}): Promise<PaginatedResponse<Course>> => {
    return requestClient().get('/courses/view', { params });
  },
  getCourseById: (id: number | string) => {
    return requestClient().get(`/courses/view/${id}`);
  },
  // Actions requiring authentication
  enroll: (token: string, data: { courseId: number }): Promise<EnrollResponse> => {
    return requestClient({ token }).post('/courses/enroll', data);
  },
  unenroll: (token: string, data: { courseId: number }): Promise<MessageResponse> => {
    return requestClient({ token }).post('/courses/unenroll', data);
  },
  getEnrolledCourses: (token: string): Promise<Enrollment[]> => {
    return requestClient({ token }).get('/courses/enrolled');
  },
  updateUnitProgress: (token: string, data: UnitProgressData): Promise<any> => {
    return requestClient({ token }).post('/courses/progress/unit', data);
  },
  // Admin Actions
  getAdminCourses: (token: string, params: AdminCourseListParams = {}) => {
    const queryParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = String(value);
      }
    }
    return requestClient({ token }).get('/courses/admin/view', { params: queryParams });
  },
  createCourse: (token: string, formData: FormData): Promise<Course> => {
    return requestClient({ token }).post('/courses', formData);
  },
  updateCourse: (token: string, id: number | string, formData: FormData): Promise<Course> => {
    return requestClient({ token }).put(`/courses/${id}`, formData);
  },
  deleteCourse: (token: string, id: number | string): Promise<MessageResponse> => {
    return requestClient({ token }).delete(`/courses/${id}`);
  },
  togglePublish: (token: string, id: number | string, data: { isPublished: boolean }): Promise<TogglePublishResponse> => {
    return requestClient({ token }).patch(`/courses/${id}/publish`, data);
  },
  getAdminCourseById: (token: string, id: number | string): Promise<Course> => {
    return requestClient({ token }).get(`/courses/${id}`);
  },
};

// --- Module Service --- (Requires Token) ---
export const moduleService = {
  createModule: (token: string, formData: FormData): Promise<Module> => {
    return requestClient({ token }).post('/courses/modules', formData);
  },
  getModulesByCourse: (token: string, params: ModuleListParams): Promise<PaginatedResponse<Module>> => {
    return requestClient({ token }).get('/courses/modules', { params });
  },
  getModuleById: (token: string, id: number | string): Promise<Module> => {
    return requestClient({ token }).get(`/courses/modules/${id}`);
  },
  updateModule: (token: string, id: number | string, formData: FormData): Promise<Module> => {
    return requestClient({ token }).put(`/courses/modules/${id}`, formData);
  },
  deleteModule: (token: string, id: number | string): Promise<MessageResponse> => {
    return requestClient({ token }).delete(`/courses/modules/${id}`);
  },
};

// --- Content Unit Service --- (Requires Token) ---
export const contentUnitService = {
  createContentUnit: (token: string, formData: FormData): Promise<ContentUnit> => {
    return requestClient({ token }).post('/courses/units', formData);
  },
  getContentUnitsByModule: (token: string, params: ContentUnitListParams): Promise<PaginatedResponse<ContentUnit>> => {
    return requestClient({ token }).get(`/courses/modules/${params.moduleId}/units`, { params });
  },
  getContentUnitById: (token: string, id: number | string): Promise<ContentUnit> => {
    return requestClient({ token }).get(`/courses/units/${id}`);
  },
  updateContentUnit: (token: string, id: number | string, data: Partial<ContentUnit>): Promise<ContentUnit> => {
    return requestClient({ token }).put(`/courses/units/${id}`, data);
  },
  deleteContentUnit: (token: string, id: number | string): Promise<MessageResponse> => {
    return requestClient({ token }).delete(`/courses/units/${id}`);
  },
};

// --- Category Service ---
export type Category = { id: number; name: string; slug: string; description?: string; icon?: string; };

export const categoryService = {
  getCategories: (): Promise<Category[]> => {
    return requestClient().get('/categories');
  },
  createCategory: (token: string, data: Omit<Category, 'id' | 'slug'>): Promise<Category> => {
    return requestClient({ token }).post('/categories', data);
  },
  deleteCategory: (token: string, id: number | string): Promise<void> => {
    return requestClient({ token }).delete(`/categories/${id}`);
  },
};

// --- Program Service ---
export type ProgramCourseLink = {
  id: number;
  orderNumber: number;
  course: { id: number; title: string; slug: string; thumbnail?: string };
};

export type Program = {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  courses: ProgramCourseLink[];
};

export const programService = {
  getPrograms: (token: string): Promise<{ count: number; data: Program[] }> => {
    return requestClient({ token }).get('/programs');
  },
  getProgramById: (token: string, id: number | string): Promise<Program> => {
    return requestClient({ token }).get(`/programs/${id}`);
  },
  createProgram: (token: string, formData: FormData): Promise<Program> => {
    return requestClient({ token }).post('/programs', formData);
  },
  updateProgram: (token: string, id: number | string, formData: FormData): Promise<Program> => {
    return requestClient({ token }).put(`/programs/${id}`, formData);
  },
  deleteProgram: (token: string, id: number | string): Promise<void> => {
    return requestClient({ token }).delete(`/programs/${id}`);
  },
  addCourse: (token: string, programId: number | string, data: { courseId: number; orderNumber?: number }): Promise<ProgramCourseLink> => {
    return requestClient({ token }).post(`/programs/${programId}/courses`, data);
  },
  removeCourse: (token: string, programId: number | string, courseId: number | string): Promise<void> => {
    return requestClient({ token }).delete(`/programs/${programId}/courses/${courseId}`);
  },
};

// Add other services...
