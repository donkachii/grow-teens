import { Instructor } from "./user";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  categoryId?: number;
  category?: Category;
  difficulty?: string;
  durationHours?: number;
  tags?: string[];
  outcomes?: string[];
  requirements?: string[];
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  instructor?: Instructor;
  _count?: CourseCount;
}

export interface CourseCount {
  enrollments: number;
  reviews: number;
  modules: number;
}

export interface CourseData {
  data: Course[];
  pagination: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseWithModules extends Course {
  modules: Module[];
}

export interface Module {
  id: number;
  title: string;
  description: string;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
  units: ContentUnit[];
  _count: {
    units: number;
    quizzes: number;
  };
}

export interface ContentUnit {
  id: number;
  title: string;
  description?: string;
  orderNumber: number;
  contentType: string;
  content?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export interface Question {
  id: number;
  question: string;
  type: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}
