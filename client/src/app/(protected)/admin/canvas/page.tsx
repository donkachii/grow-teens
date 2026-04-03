"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Badge,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  IconButton,
} from "@chakra-ui/react";
import { FiEye, FiEyeOff, FiRefreshCw, FiDownload, FiUpload, FiUsers } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { canvasService, CanvasConfig, CanvasCourse, SyncLog } from "@/services/canvasService";
import { courseService } from "@/services/api";
import { Course } from "@/types";
import { handleServerErrorMessage } from "@/utils";

const statusColors: Record<string, string> = {
  COMPLETED: "green",
  RUNNING: "blue",
  FAILED: "red",
  PENDING: "gray",
};

export default function CanvasIntegrationPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string;
  const toast = useToast();

  // Config state
  const [config, setConfig] = useState<CanvasConfig | null>(null);
  const [configForm, setConfigForm] = useState({ domain: "", apiToken: "", accountId: "1" });
  const [showToken, setShowToken] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Canvas courses state
  const [canvasCourses, setCanvasCourses] = useState<CanvasCourse[]>([]);
  const [loadingCanvasCourses, setLoadingCanvasCourses] = useState(false);
  const [importingIds, setImportingIds] = useState<Set<number>>(new Set());

  // GrowTeens courses state
  const [gtCourses, setGtCourses] = useState<Course[]>([]);
  const [pushingIds, setPushingIds] = useState<Set<number>>(new Set());
  const [syncingEnrollIds, setSyncingEnrollIds] = useState<Set<number>>(new Set());

  // Sync logs state
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const showToast = (title: string, description: string, status: "success" | "error" | "info") =>
    toast({ title, description, status, duration: 4000, isClosable: true, position: "top-right" });

  const fetchConfig = useCallback(async () => {
    if (!token) return;
    try {
      const data = await canvasService.getConfig(token);
      setConfig(data);
      if (data.domain) setConfigForm((f) => ({ ...f, domain: data.domain!, accountId: data.accountId || "1" }));
    } catch {
      // not configured yet is fine
    }
  }, [token]);

  const fetchCanvasCourses = useCallback(async () => {
    if (!token || !config?.configured) return;
    setLoadingCanvasCourses(true);
    try {
      const res = await canvasService.getCanvasCourses(token);
      setCanvasCourses(res.data);
    } catch (err) {
      showToast("Error", handleServerErrorMessage(err), "error");
    } finally {
      setLoadingCanvasCourses(false);
    }
  }, [token, config?.configured]);

  const fetchGtCourses = useCallback(async () => {
    if (!token) return;
    try {
      const res = await courseService.getAdminCourses(token, { limit: 100 });
      setGtCourses((res as any).courses || (res as any).data || []);
    } catch {
      // ignore
    }
  }, [token]);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoadingLogs(true);
    try {
      const res = await canvasService.getSyncLogs(token, { limit: 15 });
      setLogs(res.data);
    } catch {
      // ignore
    } finally {
      setLoadingLogs(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config?.configured) {
      fetchCanvasCourses();
      fetchGtCourses();
      fetchLogs();
    }
  }, [config?.configured, fetchCanvasCourses, fetchGtCourses, fetchLogs]);

  const handleSaveConfig = async () => {
    if (!configForm.domain || !configForm.apiToken) {
      showToast("Validation", "Domain and API token are required", "error");
      return;
    }
    setSavingConfig(true);
    try {
      await canvasService.saveConfig(token, configForm);
      showToast("Connected", "Canvas configuration saved and verified", "success");
      await fetchConfig();
    } catch (err) {
      showToast("Connection failed", handleServerErrorMessage(err), "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleImportOne = async (course: CanvasCourse) => {
    setImportingIds((s) => new Set(s).add(course.id));
    try {
      const res = await canvasService.importCourses(token, { courseIds: [course.id] });
      showToast("Imported", res.message, "success");
      await Promise.all([fetchCanvasCourses(), fetchLogs()]);
    } catch (err) {
      showToast("Import failed", handleServerErrorMessage(err), "error");
    } finally {
      setImportingIds((s) => { const next = new Set(s); next.delete(course.id); return next; });
    }
  };

  const handleImportAll = async () => {
    setLoadingCanvasCourses(true);
    try {
      const res = await canvasService.importCourses(token);
      showToast("Import complete", res.message, "success");
      await Promise.all([fetchCanvasCourses(), fetchLogs()]);
    } catch (err) {
      showToast("Import failed", handleServerErrorMessage(err), "error");
    } finally {
      setLoadingCanvasCourses(false);
    }
  };

  const handlePushCourse = async (course: Course) => {
    setPushingIds((s) => new Set(s).add(course.id));
    try {
      const res = await canvasService.pushCourse(token, course.id);
      showToast("Pushed", res.message, "success");
      await Promise.all([fetchGtCourses(), fetchLogs()]);
    } catch (err) {
      showToast("Push failed", handleServerErrorMessage(err), "error");
    } finally {
      setPushingIds((s) => { const next = new Set(s); next.delete(course.id); return next; });
    }
  };

  const handleSyncEnrollments = async (course: Course) => {
    setSyncingEnrollIds((s) => new Set(s).add(course.id));
    try {
      const res = await canvasService.syncEnrollments(token, course.id);
      showToast("Enrollments synced", res.message, "success");
      await fetchLogs();
    } catch (err) {
      showToast("Sync failed", handleServerErrorMessage(err), "error");
    } finally {
      setSyncingEnrollIds((s) => { const next = new Set(s); next.delete(course.id); return next; });
    }
  };

  return (
    <Box maxW="6xl" mx="auto" py={8} px={4}>
      <Heading size="lg" mb={1}>Canvas LMS Integration</Heading>
      <Text color="gray.500" mb={8}>
        Connect GrowTeens to your Canvas LMS instance to sync courses and enrollments.
      </Text>

      {/* ── Configuration ─────────────────────────────────────────── */}
      <Box bg="white" rounded="xl" shadow="sm" border="1px" borderColor="gray.100" p={6} mb={8}>
        <Heading size="sm" mb={4}>Canvas Configuration</Heading>
        {config?.configured && (
          <Alert status="success" rounded="md" mb={4}>
            <AlertIcon />
            <AlertDescription>
              Connected to <strong>{config.domain}</strong> (account: {config.accountId})
            </AlertDescription>
          </Alert>
        )}
        <Stack spacing={4}>
          <FormControl>
            <FormLabel fontSize="sm">Canvas Domain</FormLabel>
            <Input
              placeholder="myschool.instructure.com"
              value={configForm.domain}
              onChange={(e) => setConfigForm((f) => ({ ...f, domain: e.target.value }))}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Account ID</FormLabel>
            <Input
              placeholder="1"
              value={configForm.accountId}
              onChange={(e) => setConfigForm((f) => ({ ...f, accountId: e.target.value }))}
              w="120px"
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">API Token</FormLabel>
            <InputGroup>
              <Input
                type={showToken ? "text" : "password"}
                placeholder="Canvas API access token"
                value={configForm.apiToken}
                onChange={(e) => setConfigForm((f) => ({ ...f, apiToken: e.target.value }))}
              />
              <InputRightElement>
                <IconButton
                  aria-label="Toggle visibility"
                  size="sm"
                  variant="ghost"
                  icon={showToken ? <FiEyeOff /> : <FiEye />}
                  onClick={() => setShowToken((v) => !v)}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={handleSaveConfig}
            isLoading={savingConfig}
            loadingText="Verifying..."
            w="fit-content"
          >
            {config?.configured ? "Update Configuration" : "Connect Canvas"}
          </Button>
        </Stack>
      </Box>

      {config?.configured && (
        <>
          {/* ── Canvas Courses ──────────────────────────────────────── */}
          <Box bg="white" rounded="xl" shadow="sm" border="1px" borderColor="gray.100" p={6} mb={8}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="sm">Canvas Courses</Heading>
              <HStack>
                <Button
                  size="sm"
                  leftIcon={<FiDownload />}
                  variant="outline"
                  onClick={handleImportAll}
                  isLoading={loadingCanvasCourses}
                >
                  Import All
                </Button>
                <IconButton
                  aria-label="Refresh"
                  size="sm"
                  variant="ghost"
                  icon={<FiRefreshCw />}
                  onClick={fetchCanvasCourses}
                  isLoading={loadingCanvasCourses}
                />
              </HStack>
            </Flex>
            {loadingCanvasCourses ? (
              <Flex justify="center" py={8}><Spinner /></Flex>
            ) : canvasCourses.length === 0 ? (
              <Text color="gray.400" textAlign="center" py={6}>No courses found in Canvas</Text>
            ) : (
              <Box overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Canvas Course</Th>
                      <Th>Code</Th>
                      <Th>Status</Th>
                      <Th>Linked</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {canvasCourses.map((cc) => (
                      <Tr key={cc.id}>
                        <Td fontWeight="medium">{cc.name}</Td>
                        <Td color="gray.500">{cc.course_code}</Td>
                        <Td>
                          <Badge colorScheme={cc.workflow_state === "available" ? "green" : "gray"}>
                            {cc.workflow_state}
                          </Badge>
                        </Td>
                        <Td>
                          {cc.growTeensCourse ? (
                            <Badge colorScheme="purple">Linked</Badge>
                          ) : (
                            <Badge colorScheme="gray">Not linked</Badge>
                          )}
                        </Td>
                        <Td>
                          <Button
                            size="xs"
                            leftIcon={<FiDownload />}
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleImportOne(cc)}
                            isLoading={importingIds.has(cc.id)}
                          >
                            {cc.growTeensCourse ? "Re-import" : "Import"}
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>

          {/* ── GrowTeens Courses → Canvas ──────────────────────────── */}
          <Box bg="white" rounded="xl" shadow="sm" border="1px" borderColor="gray.100" p={6} mb={8}>
            <Heading size="sm" mb={4}>GrowTeens Courses</Heading>
            {gtCourses.length === 0 ? (
              <Text color="gray.400" textAlign="center" py={6}>No courses found</Text>
            ) : (
              <Box overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Course</Th>
                      <Th>Canvas Link</Th>
                      <Th>Published</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {gtCourses.map((course) => (
                      <Tr key={course.id}>
                        <Td fontWeight="medium">{course.title}</Td>
                        <Td>
                          {(course as any).canvasId ? (
                            <Badge colorScheme="purple">Canvas ID: {(course as any).canvasId}</Badge>
                          ) : (
                            <Badge colorScheme="gray">Not pushed</Badge>
                          )}
                        </Td>
                        <Td>
                          <Badge colorScheme={course.isPublished ? "green" : "gray"}>
                            {course.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Button
                              size="xs"
                              leftIcon={<FiUpload />}
                              colorScheme="teal"
                              variant="ghost"
                              onClick={() => handlePushCourse(course)}
                              isLoading={pushingIds.has(course.id)}
                            >
                              {(course as any).canvasId ? "Update" : "Push"}
                            </Button>
                            {(course as any).canvasId && (
                              <Button
                                size="xs"
                                leftIcon={<FiUsers />}
                                colorScheme="orange"
                                variant="ghost"
                                onClick={() => handleSyncEnrollments(course)}
                                isLoading={syncingEnrollIds.has(course.id)}
                              >
                                Sync Enrollments
                              </Button>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>

          {/* ── Sync Logs ─────────────────────────────────────────────── */}
          <Box bg="white" rounded="xl" shadow="sm" border="1px" borderColor="gray.100" p={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="sm">Sync History</Heading>
              <IconButton
                aria-label="Refresh logs"
                size="sm"
                variant="ghost"
                icon={<FiRefreshCw />}
                onClick={fetchLogs}
                isLoading={loadingLogs}
              />
            </Flex>
            {loadingLogs ? (
              <Flex justify="center" py={6}><Spinner /></Flex>
            ) : logs.length === 0 ? (
              <Text color="gray.400" textAlign="center" py={6}>No sync operations yet</Text>
            ) : (
              <Box overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Operation</Th>
                      <Th>Status</Th>
                      <Th>Records</Th>
                      <Th>Details</Th>
                      <Th>Started</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {logs.map((log) => (
                      <Tr key={log.id}>
                        <Td fontFamily="mono" fontSize="xs">{log.operation}</Td>
                        <Td>
                          <Badge colorScheme={statusColors[log.status] || "gray"}>
                            {log.status}
                          </Badge>
                        </Td>
                        <Td>{log.recordCount ?? "—"}</Td>
                        <Td color={log.error ? "red.500" : "gray.600"} fontSize="xs" maxW="300px" isTruncated>
                          {log.error || log.details || "—"}
                        </Td>
                        <Td fontSize="xs" color="gray.500">
                          {new Date(log.createdAt).toLocaleString()}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
