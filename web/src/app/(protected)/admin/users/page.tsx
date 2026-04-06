/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Card,
  CardHeader,
  CardBody,
  HStack,
  Avatar,
  Badge,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

import { toast } from "react-toastify";

import {
  FiSearch,
  FiSettings,
  FiMessageCircle,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiUserCheck,
  FiRefreshCw,
} from "react-icons/fi";

import requestClient from "@/lib/requestClient";
import { useSession } from "next-auth/react";
import { NextAuthUserSession } from "@/types";
import { handleServerErrorMessage } from "@/utils";

interface UserPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ServerUser {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  profileImage?: string;
  lastActiveFormatted?: string;
  isOnline?: boolean;
  createdAtFormatted?: string;
}

interface UserResponse {
  users: ServerUser[];
  pagination: UserPagination;
}

const UsersPage = () => {
  const { data: sessionData } = useSession() as {
    data: NextAuthUserSession | null;
  };

  const [users, setUsers] = useState<ServerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UserPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  const cardBg = useColorModeValue("white", "gray.800");

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ServerUser | null>(null);
  const [newStatus, setNewStatus] = useState<"active" | "pending">("active");
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const fetchUsers = useCallback(
    async (page = 1) => {
      if (!sessionData?.user) return;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
        });

        if (searchQuery) queryParams.append("search", searchQuery);
        if (roleFilter) queryParams.append("role", roleFilter);
        if (statusFilter) queryParams.append("status", statusFilter);

        const response = await requestClient({
          token: sessionData?.user?.token,
        }).get<UserResponse>(`/users?${queryParams.toString()}`);

        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } catch (err) {
        const message = handleServerErrorMessage(err);
        setError(message);
        toast.error(message);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionData, searchQuery, roleFilter, statusFilter, pagination.limit]
  );

  const handleUpdateUserStatus = useCallback(async () => {
    if (!selectedUser) return;

    try {
      await requestClient({ token: sessionData?.user?.token }).patch(
        `/users/${selectedUser.id}/status`,
        { status: newStatus }
      );

      toast.success(
        `User ${selectedUser.fullName} has been ${
          newStatus === "active" ? "activated" : "deactivated"
        }`
      );

      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(handleServerErrorMessage(err));
    } finally {
      setIsStatusDialogOpen(false);
      setSelectedUser(null);
    }
  }, [selectedUser, newStatus, sessionData, fetchUsers, pagination.page]);

  const handleUpdateUserRole = useCallback(
    async (userId: number, role: string) => {
      try {
        await requestClient({ token: sessionData?.user?.token }).patch(
          `users/${userId}/role`,
          { role }
        );

        toast.success(`User role has been updated to ${role}`);

        fetchUsers(pagination.page);
      } catch (err) {
        toast.error(handleServerErrorMessage(err));
      }
    },
    [sessionData, fetchUsers, pagination.page]
  );

  const openStatusDialog = (user: ServerUser, status: "active" | "pending") => {
    setSelectedUser(user);
    setNewStatus(status);
    setIsStatusDialogOpen(true);
  };

  useEffect(() => {
    if (sessionData?.user) {
      fetchUsers(1);
    }
  }, [sessionData, fetchUsers, searchQuery, roleFilter, statusFilter]);

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage);
  };

  //TODO: Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Box p={6}>
      <AlertDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {newStatus === "active" ? "Activate" : "Deactivate"} User
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to{" "}
              {newStatus === "active" ? "activate" : "deactivate"}{" "}
              {selectedUser?.fullName}?
              {newStatus === "active"
                ? " This will allow them to access the platform."
                : " This will prevent them from accessing the platform."}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsStatusDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                colorScheme={newStatus === "active" ? "green" : "red"}
                onClick={handleUpdateUserStatus}
                ml={3}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Card p={4} boxShadow="md" borderRadius="lg" bg={cardBg} mb={8}>
        <CardHeader pb={2}>
          <Flex
            justify="space-between"
            align="center"
            direction={{ base: "column", md: "row" }}
            gap={{ base: 3, md: 0 }}
          >
            <Heading size="md">User Management</Heading>
            <Flex gap={2} flexWrap={{ base: "wrap", md: "nowrap" }}>
              <InputGroup size="sm" maxW="200px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search users"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </InputGroup>

              <Select
                size="sm"
                placeholder="Filter by role"
                maxW="150px"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="TEEN">Teens</option>
                <option value="MENTOR">Mentors</option>
                <option value="SPONSORS">Sponsors</option>
                <option value="ADMIN">Admins</option>
              </Select>

              <Select
                size="sm"
                placeholder="Filter by status"
                maxW="150px"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </Select>

              <IconButton
                aria-label="Refresh data"
                icon={<FiRefreshCw />}
                size="sm"
                onClick={() => fetchUsers(pagination.page)}
                isLoading={isLoading}
              />

              {/* Uncomment the following button to enable adding users */}
              {/* <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FiPlus />}
                onClick={() =>
                  toast.info("Add user functionality coming soon!")
                }
              >
                Add User
              </Button> */}
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : error ? (
            <Flex
              justify="center"
              align="center"
              py={10}
              direction="column"
              gap={4}
            >
              <Text color="red.500">{error}</Text>
              <Button onClick={() => fetchUsers(1)} leftIcon={<FiRefreshCw />}>
                Try Again
              </Button>
            </Flex>
          ) : (
            <>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>User</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Last Active</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <Tr key={user.id}>
                        <Td>
                          <Flex align="center">
                            <Avatar
                              size="sm"
                              name={user.fullName}
                              src={user.profileImage}
                              mr={2}
                              bg={user.isOnline ? "green.500" : "gray.400"}
                            />
                            <Box>
                              <Text fontWeight="medium">{user.fullName}</Text>
                              <Text fontSize="xs" color="gray.500">
                                {user.email}
                              </Text>
                            </Box>
                          </Flex>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              user.role === "TEEN"
                                ? "blue"
                                : user.role === "MENTOR"
                                ? "purple"
                                : user.role === "SPONSORS"
                                ? "green"
                                : "gray"
                            }
                          >
                            {user.role}
                          </Badge>
                        </Td>
                        <Td>
                          <Flex align="center">
                            <Box
                              w="8px"
                              h="8px"
                              borderRadius="full"
                              bg={user.emailVerified ? "green.500" : "gray.300"}
                              mr={2}
                            />
                            <Text fontSize="sm">
                              {user.emailVerified ? "Active" : "Pending"}
                            </Text>
                          </Flex>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {user.lastActiveFormatted || "Never"}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="Role options"
                                icon={<FiUserCheck />}
                                size="sm"
                                variant="ghost"
                                colorScheme="purple"
                              />
                              <MenuList>
                                <MenuItem
                                  isDisabled={user.role === "TEEN"}
                                  onClick={() =>
                                    handleUpdateUserRole(user.id, "TEEN")
                                  }
                                >
                                  Set as Teen
                                </MenuItem>
                                <MenuItem
                                  isDisabled={user.role === "MENTOR"}
                                  onClick={() =>
                                    handleUpdateUserRole(user.id, "MENTOR")
                                  }
                                >
                                  Set as Mentor
                                </MenuItem>
                                <MenuItem
                                  isDisabled={user.role === "SPONSORS"}
                                  onClick={() =>
                                    handleUpdateUserRole(user.id, "SPONSORS")
                                  }
                                >
                                  Set as Sponsor
                                </MenuItem>
                                <MenuItem
                                  isDisabled={user.role === "ADMIN"}
                                  onClick={() =>
                                    handleUpdateUserRole(user.id, "ADMIN")
                                  }
                                >
                                  Set as Admin
                                </MenuItem>
                              </MenuList>
                            </Menu>

                            <IconButton
                              aria-label="Message user"
                              icon={<FiMessageCircle />}
                              size="sm"
                              variant="ghost"
                              colorScheme="green"
                              onClick={() =>
                                toast.info(
                                  `Message to ${user.fullName} will be implemented soon!`
                                )
                              }
                            />

                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="More options"
                                icon={<FiMoreVertical />}
                                size="sm"
                                variant="ghost"
                              />
                              <MenuList>
                                {!user.emailVerified ? (
                                  <MenuItem
                                    icon={<FiCheckCircle />}
                                    onClick={() =>
                                      openStatusDialog(user, "active")
                                    }
                                  >
                                    Activate Account
                                  </MenuItem>
                                ) : (
                                  <MenuItem
                                    icon={<FiXCircle />}
                                    onClick={() =>
                                      openStatusDialog(user, "pending")
                                    }
                                  >
                                    Deactivate Account
                                  </MenuItem>
                                )}
                                <MenuItem
                                  icon={<FiSettings />}
                                  onClick={() =>
                                    toast.info("User settings coming soon!")
                                  }
                                >
                                  User Settings
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={4}>
                        <Text color="gray.500">
                          No users found matching your criteria
                        </Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>

              {/* Pagination controls */}
              <Flex
                justify="space-between"
                align="center"
                mt={4}
                flexDir={{ base: "column", sm: "row" }}
                gap={4}
              >
                <Text fontSize="sm" color="gray.500">
                  Showing {users.length} of {pagination.total} users
                </Text>
                <HStack>
                  <Button
                    size="sm"
                    variant="outline"
                    isDisabled={!pagination.hasPrevious}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>

                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={
                            pagination.page === pageNum ? "solid" : "outline"
                          }
                          colorScheme={
                            pagination.page === pageNum ? "blue" : undefined
                          }
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    isDisabled={!pagination.hasNext}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            </>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default UsersPage;
