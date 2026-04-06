import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import prisma from "../prismaClient.ts";

/**
 * Get current user profile
 * @route GET /api/users/me
 * @access Authenticated users
 */
export const getUser = async (req: Request, res: Response) => {
  try {
    // Return current user data (already attached by auth middleware)
    res.json(req.user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      error: "Failed to retrieve user profile",
    });
  }
};

/**
 * Get all users with pagination, sorting and filtering
 * @route GET /api/users
 * @access Admin only
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Extract query parameters with validation
    const q = req.query as Record<string, string>;
    let {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
      role,
      search,
      status,
    } = q;

    // Validate and convert pagination parameters
    let pageNum, limitNum;
    try {
      pageNum = Math.max(1, parseInt(page));
      limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Limit between 1-100
    } catch (e) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Validate admin role
    if (req.user!.role !== "ADMIN") {
      return res.status(403).json({
        error: "Access denied. Only administrators can access user lists.",
      });
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ["firstName", "lastName", "email", "role", "createdAt", "lastActive"];
    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "createdAt"; // Default to safe value if invalid
    }

    // Validate order direction
    order = order.toLowerCase() === "asc" ? "asc" : "desc";

    // Build filter object
    const filter: Prisma.UserWhereInput = {};
    
    // Add role filter if provided and valid
    if (role) {
      const validRoles = ["TEEN", "MENTOR", "SPONSORS", "ADMIN"];
      if (validRoles.includes(role)) {
        filter.role = role as any;
      }
    }

    // Add search filter if provided (minimum 2 characters)
    if (search && search.length >= 2) {
      filter.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add status filter if provided
    if (status === "active") {
      filter.emailVerified = true;
    } else if (status === "pending") {
      filter.emailVerified = false;
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where: filter });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum) || 1;
    
    // Adjust page number if it exceeds total pages
    if (pageNum > totalPages) {
      pageNum = totalPages;
    }

    // Get users with pagination and sorting
    const users = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true,
        profileImage: true,
        createdAt: true,
        lastActive: true,
        // Exclude password and other sensitive fields
      },
      skip,
      take: limitNum,
      orderBy: {
        [sortBy]: order,
      },
    });

    // Process users to add a human-readable "lastActiveFormatted" field
    const processedUsers = users.map(user => {
      // Format full name for convenience
      const fullName = `${user.firstName} ${user.lastName}`;
      
      // Convert lastActive to relative time
      let lastActiveFormatted = "Never";
      
      if (user.lastActive) {
        const now = new Date();
        const lastActive = new Date(user.lastActive);
        const diffMs = now.getTime() - lastActive.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) {
          lastActiveFormatted = "Just now";
        } else if (diffMins < 60) {
          lastActiveFormatted = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
          lastActiveFormatted = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 30) {
          lastActiveFormatted = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
          // Format as date string for older timestamps
          lastActiveFormatted = lastActive.toLocaleDateString();
        }
      }
      
      return {
        ...user,
        fullName,
        lastActiveFormatted,
        // Add online status based on recent activity (within last 5 minutes)
        isOnline: user.lastActive ? (new Date().getTime() - new Date(user.lastActive).getTime()) < 5 * 60 * 1000 : false,
        // Format createdAt to a readable date 
        createdAtFormatted: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null,
      };
    });

    // Return the processed users with pagination details
    return res.json({
      users: processedUsers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      error: "An error occurred while fetching users",
      message: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
    });
  }
};

/**
 * Update a user's verification status
 * @route PATCH /api/users/:userId/status
 * @access Admin only
 */
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    // Validate admin role
    if (req.user!.role !== "ADMIN") {
      return res.status(403).json({
        error: "Access denied. Only administrators can modify user status.",
      });
    }
    
    if (!userId || !status) {
      return res.status(400).json({
        error: "User ID and status are required",
      });
    }

    if (!["active", "pending"].includes(status)) {
      return res.status(400).json({
        error: "Status must be either 'active' or 'pending'",
      });
    }
    
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    
    if (!userExists) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    
    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        emailVerified: status === "active",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });
    
    return res.json({
      message: `User status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    
    // Handle specific database errors
    if ((error as NodeJS.ErrnoException).code === 'P2025') {
      return res.status(404).json({
        error: "User not found",
      });
    }
    
    return res.status(500).json({
      error: "An error occurred while updating user status",
      message: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
    });
  }
};

/**
 * Update user's last active timestamp
 * @route POST /api/users/update-activity
 * @access Authenticated users
 */
export const updateLastActive = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user!.id) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { lastActive: new Date() }
    });
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Error updating lastActive:", error);
    return res.status(500).json({ error: "Failed to update activity status" });
  }
};

/**
 * Admin route to update a user's role
 * @route PATCH /api/users/:userId/role
 * @access Admin only
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Validate admin role
    if (req.user!.role !== "ADMIN") {
      return res.status(403).json({
        error: "Access denied. Only administrators can modify user roles.",
      });
    }
    
    if (!userId || !role) {
      return res.status(400).json({
        error: "User ID and role are required",
      });
    }

    const validRoles = ["TEEN", "MENTOR", "SPONSORS", "ADMIN"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Role must be one of: " + validRoles.join(", "),
      });
    }

    // Prevent changing own role (safeguard against admins removing their own admin access)
    if (parseInt(userId) === req.user!.id) {
      return res.status(400).json({
        error: "You cannot change your own role",
      });
    }
    
    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });
    
    return res.json({
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    
    // Handle specific database errors
    if ((error as NodeJS.ErrnoException).code === 'P2025') {
      return res.status(404).json({
        error: "User not found",
      });
    }
    
    return res.status(500).json({
      error: "An error occurred while updating user role",
    });
  }
};
