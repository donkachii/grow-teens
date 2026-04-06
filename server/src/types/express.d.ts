import type { User, Enrollment } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "password"> & { enrollments?: Enrollment[] };
      cloudinaryUrl?: string;
      cloudinaryPublicId?: string;
      cloudinaryThumbnailId?: string;
      cloudinaryCoverImageId?: string;
      coverImageUrl?: string;
    }
  }
}

export {};
