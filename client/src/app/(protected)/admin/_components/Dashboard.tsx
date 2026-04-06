"use client";

import React from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  Card,
  CardHeader,
  CardBody,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  IconButton,
  Progress,
  useColorModeValue,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import {
  FiUsers,
  FiBookOpen,
  FiUserCheck,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiDownload,
  FiRefreshCw,
  FiSettings,
  FiBell,
  FiChevronDown,
  FiStar,
} from "react-icons/fi";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,

} from "recharts";

interface Metrics {
  id: number;
  title: string;
  value: string;
  icon: React.ReactElement;
  bgColor: string;
  bgPattern: string;
  accentColor: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

interface RecentActivity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  icon: React.ReactElement;
  color: string;
}

const AdminDashboard = () => {

  const metricsOverview: Metrics[] = [
    {
      id: 1,
      title: "Total Users",
      value: "1,200",
      icon: <FiUsers size={24} />,
      bgColor: "blue.50",
      accentColor: "blue.500",
      change: "+12%",
      trend: "up",
      bgPattern: `
        radial-gradient(circle at 10% 20%, rgba(66, 153, 225, 0.2) 0%, rgba(66, 153, 225, 0.05) 20%, transparent 50%),
        radial-gradient(circle at 85% 60%, rgba(66, 153, 225, 0.15) 0%, transparent 45%)
      `,
    },
    {
      id: 2,
      title: "Active Courses",
      value: "35",
      icon: <FiBookOpen size={24} />,
      bgColor: "purple.50",
      accentColor: "purple.500",
      change: "+5%",
      trend: "up",
      bgPattern: `
        linear-gradient(45deg, rgba(159, 122, 234, 0.08) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(159, 122, 234, 0.08) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(159, 122, 234, 0.08) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(159, 122, 234, 0.08) 75%)
      `,
    },
    {
      id: 3,
      title: "Pending Mentorships",
      value: "10",
      icon: <FiUserCheck size={24} />,
      bgColor: "green.50",
      accentColor: "green.500",
      change: "-2%",
      trend: "down",
      bgPattern: `
        repeating-linear-gradient(0deg, transparent, transparent 4px, 
        rgba(72, 187, 120, 0.06) 4px, rgba(72, 187, 120, 0.06) 8px),
        repeating-linear-gradient(90deg, transparent, transparent 4px, 
        rgba(72, 187, 120, 0.06) 4px, rgba(72, 187, 120, 0.06) 8px)
      `,
    },
    {
      id: 4,
      title: "Total Events",
      value: "5",
      icon: <FiCalendar size={24} />,
      bgColor: "orange.50",
      accentColor: "orange.500",
      change: "+2",
      trend: "up",
      bgPattern: `
        radial-gradient(circle at 70% 30%, rgba(237, 137, 54, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 30% 70%, rgba(237, 137, 54, 0.1) 0%, transparent 35%)
      `,
    },
  ];

  // const performanceMetrics: Metrics[] = [
  //   {
  //     id: 5,
  //     title: "Conversion Rate",
  //     value: "24.8%",
  //     icon: <FiBarChart2 size={24} />,
  //     bgColor: "teal.50",
  //     accentColor: "teal.500",
  //     change: "+3.2%",
  //     trend: "up",
  //     bgPattern: `
  //       linear-gradient(120deg, rgba(79, 209, 197, 0.05) 0%, rgba(79, 209, 197, 0.1) 100%)
  //     `,
  //   },
  //   {
  //     id: 6,
  //     title: "Weekly Growth",
  //     value: "+8.3%",
  //     icon: <FiActivity size={24} />,
  //     bgColor: "red.50",
  //     accentColor: "red.500",
  //     change: "-1.5%",
  //     trend: "down",
  //     bgPattern: `
  //       linear-gradient(30deg, rgba(245, 101, 101, 0.05) 0%, transparent 100%),
  //       linear-gradient(150deg, rgba(245, 101, 101, 0.05) 0%, transparent 100%)
  //     `,
  //   },
  //   {
  //     id: 7,
  //     title: "Course Completion",
  //     value: "72%",
  //     icon: <FiAward size={24} />,
  //     bgColor: "yellow.50",
  //     accentColor: "yellow.500",
  //     change: "+5%",
  //     trend: "up",
  //     bgPattern: `
  //       repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 9px, rgba(236, 201, 75, 0.05) 9px, rgba(236, 201, 75, 0.05) 10px)
  //     `,
  //   },
  //   {
  //     id: 8,
  //     title: "Avg. Session Time",
  //     value: "18.5 min",
  //     icon: <FiClock size={24} />,
  //     bgColor: "cyan.50",
  //     accentColor: "cyan.500",
  //     change: "+2.3 min",
  //     trend: "up",
  //     bgPattern: `
  //       linear-gradient(135deg, rgba(49, 151, 149, 0.06) 25%, transparent 25%),
  //       linear-gradient(225deg, rgba(49, 151, 149, 0.06) 25%, transparent 25%),
  //       linear-gradient(315deg, rgba(49, 151, 149, 0.06) 25%, transparent 25%),
  //       linear-gradient(45deg, rgba(49, 151, 149, 0.06) 25%, transparent 25%)
  //     `,
  //   },
  // ];

  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      action: "New user registered",
      user: "Alex Johnson",
      timestamp: "Just now",
      icon: <FiUserCheck />,
      color: "green.500",
    },
    {
      id: 2,
      action: "New course published",
      user: "Admin",
      timestamp: "2 hours ago",
      icon: <FiBookOpen />,
      color: "blue.500",
    },
    {
      id: 3,
      action: "User reported an issue",
      user: "Sarah Williams",
      timestamp: "Yesterday",
      icon: <FiAlertCircle />,
      color: "orange.500",
    },
    {
      id: 4,
      action: "Mentorship request approved",
      user: "John Doe",
      timestamp: "2 days ago",
      icon: <FiCheckCircle />,
      color: "purple.500",
    },
    {
      id: 5,
      action: "New event scheduled",
      user: "Admin",
      timestamp: "3 days ago",
      icon: <FiCalendar />,
      color: "teal.500",
    },
  ];

  const userGrowthData = [
    { name: "Jan", users: 300 },
    { name: "Feb", users: 450 },
    { name: "Mar", users: 620 },
    { name: "Apr", users: 790 },
    { name: "May", users: 900 },
    { name: "Jun", users: 1050 },
    { name: "Jul", users: 1200 },
  ];

  const enrollmentData = [
    { name: "Tech Courses", value: 540 },
    { name: "Leadership", value: 320 },
    { name: "Entrepreneurship", value: 210 },
    { name: "Financial Literacy", value: 130 },
  ];

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  const deviceUsageData = [
    { name: "Mobile", value: 65 },
    { name: "Desktop", value: 30 },
    { name: "Tablet", value: 5 },
  ];

  const DEVICE_COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const weeklyActivityData = [
    { day: "Mon", activity: 65 },
    { day: "Tue", activity: 59 },
    { day: "Wed", activity: 80 },
    { day: "Thu", activity: 81 },
    { day: "Fri", activity: 56 },
    { day: "Sat", activity: 40 },
    { day: "Sun", activity: 28 },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Digital Skills Workshop",
      date: "April 15, 2025",
      attendees: 42,
    },
    {
      id: 2,
      title: "Leadership Conference",
      date: "April 22, 2025",
      attendees: 120,
    },
    {
      id: 3,
      title: "Mentorship Orientation",
      date: "May 1, 2025",
      attendees: 18,
    },
  ];

  const topCourses = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      enrollments: 125,
      completion: 82,
      rating: 4.8,
    },
    {
      id: 2,
      title: "Public Speaking for Teens",
      enrollments: 98,
      completion: 75,
      rating: 4.6,
    },
    {
      id: 3,
      title: "Financial Literacy 101",
      enrollments: 86,
      completion: 68,
      rating: 4.7,
    },
    {
      id: 4,
      title: "Mobile App Development",
      enrollments: 72,
      completion: 65,
      rating: 4.5,
    },
  ];

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box p={6}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        bg={cardBg}
        p={4}
        borderRadius="lg"
        boxShadow="sm"
        mb={6}
      >
        <Box>
          <Heading size="lg" mb={1}>
            Admin Dashboard
          </Heading>
          <Text color="gray.500">Welcome back! Here&apos;s what&apos;s happening today.</Text>
        </Box>

        <HStack spacing={4} mt={{ base: 4, md: 0 }}>
          <IconButton
            aria-label="Refresh data"
            icon={<FiRefreshCw />}
            variant="ghost"
            colorScheme="gray"
          />
          <IconButton
            aria-label="Download report"
            icon={<FiDownload />}
            variant="ghost"
            colorScheme="gray"
          />
          <IconButton
            aria-label="Notifications"
            icon={<FiBell />}
            variant="ghost"
            colorScheme="gray"
            position="relative"
          >
            <Box
              position="absolute"
              top={1}
              right={1}
              bg="red.500"
              borderRadius="full"
              width="8px"
              height="8px"
            />
          </IconButton>
          <Menu>
            <MenuButton as={Button} rightIcon={<FiChevronDown />} variant="ghost">
              Actions
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiPlus />}>Add New User</MenuItem>
              <MenuItem icon={<FiBookOpen />}>Create Course</MenuItem>
              <MenuItem icon={<FiCalendar />}>Schedule Event</MenuItem>
              <MenuItem icon={<FiSettings />}>Settings</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mb={8}>
        {metricsOverview.map((metric) => (
          <Card
            key={metric.id}
            position="relative"
            overflow="hidden"
            borderRadius="lg"
            boxShadow="md"
            height="150px"
            transition="transform 0.3s, box-shadow 0.3s"
            _hover={{
              transform: "translateY(-5px)",
              boxShadow: "lg",
            }}
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg={metric.bgColor}
              backgroundImage={metric.bgPattern}
              backgroundSize="cover"
              opacity={1}
            />

            <CardHeader pb={0} position="relative">
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Box
                    color={metric.accentColor}
                    bg={`${metric.accentColor}20`}
                    borderRadius="full"
                    p={2}
                    mr={3}
                  >
                    {metric.icon}
                  </Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    {metric.title}
                  </Text>
                </Flex>
                {/* <Box>
                  {metric.trend === "up" && <StatArrow type="increase" color="green.500" />}
                  {metric.trend === "down" && <StatArrow type="decrease" color="red.500" />}
                </Box> */}
              </Flex>
            </CardHeader>

            <CardBody position="relative" pt={0}>
              <Text fontSize="3xl" fontWeight="bold">
                {metric.value}
              </Text>
              <Text
                fontSize="sm"
                color={
                  metric.trend === "up"
                    ? "green.500"
                    : metric.trend === "down"
                    ? "red.500"
                    : "gray.500"
                }
              >
                {metric.change} from last month
              </Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
        <Card
          gridColumn={{ lg: "span 2" }}
          p={4}
          boxShadow="md"
          borderRadius="lg"
          bg={cardBg}
        >
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md">User Growth</Heading>
              <HStack>
                <Select size="sm" defaultValue="6months" w="140px">
                  <option value="30days">Last 30 Days</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="year">This Year</option>
                </Select>
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={userGrowthData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        <Card p={4} boxShadow="md" borderRadius="lg" bg={cardBg} overflow="hidden">
          <CardHeader pb={2}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Recent Activity</Heading>
              <Button size="xs" variant="ghost" colorScheme="blue">
                View All
              </Button>
            </Flex>
          </CardHeader>
          <CardBody px={1}>
            <VStack spacing={4} align="stretch">
              {recentActivities.map((activity) => (
                <HStack key={activity.id} spacing={3} p={2} borderRadius="md" _hover={{ bg: "gray.50" }}>
                  <Box
                    p={2}
                    borderRadius="full"
                    bg={`${activity.color}20`}
                    color={activity.color}
                  >
                    {activity.icon}
                  </Box>
                  <Box flex="1">
                    <Text fontWeight="medium">{activity.action}</Text>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="gray.500">
                        by {activity.user}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {activity.timestamp}
                      </Text>
                    </Flex>
                  </Box>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
        <Card p={4} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <CardHeader pb={1}>
            <Heading size="md">Course Distribution</Heading>
          </CardHeader>
          <CardBody>
            <Box h="250px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enrollmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {enrollmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        <Card p={4} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <CardHeader pb={1}>
            <Heading size="md">Weekly Activity</Heading>
          </CardHeader>
          <CardBody>
            <Box h="250px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyActivityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="activity" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        <Card p={4} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <CardHeader pb={1}>
            <Heading size="md">Device Usage</Heading>
          </CardHeader>
          <CardBody>
            <Box h="250px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <Card p={4} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <CardHeader pb={2}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Top Performing Courses</Heading>
              <Button size="xs" variant="ghost" colorScheme="blue">
                View All
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {topCourses.map((course) => (
                <Box key={course.id} p={3} borderRadius="md" border="1px" borderColor={borderColor}>
                  <Flex justify="space-between" mb={2}>
                    <Heading size="sm">{course.title}</Heading>
                    <HStack>
                      <FiStar color="gold" />
                      <Text fontWeight="bold">{course.rating}</Text>
                    </HStack>
                  </Flex>
                  <SimpleGrid columns={3} spacing={2}>
                    <Stat size="sm">
                      <StatLabel fontSize="xs">Enrollments</StatLabel>
                      <StatNumber fontSize="md">{course.enrollments}</StatNumber>
                    </Stat>
                    <Stat size="sm">
                      <StatLabel fontSize="xs">Completion</StatLabel>
                      <StatNumber fontSize="md">{course.completion}%</StatNumber>
                    </Stat>
                    <Box alignSelf="center">
                      <Progress
                        value={course.completion}
                        size="sm"
                        colorScheme={
                          course.completion >= 80
                            ? "green"
                            : course.completion >= 60
                            ? "blue"
                            : course.completion >= 40
                            ? "yellow"
                            : "red"
                        }
                        borderRadius="full"
                      />
                    </Box>
                  </SimpleGrid>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        <Card p={4} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <CardHeader pb={2}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Upcoming Events</Heading>
              <Button size="xs" variant="ghost" colorScheme="blue">
                Schedule New
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {upcomingEvents.map((event) => (
                <Flex
                  key={event.id}
                  p={4}
                  borderRadius="md"
                  bg="gray.50"
                  border="1px"
                  borderColor={borderColor}
                  justify="space-between"
                  align="center"
                >
                  <Box>
                    <Heading size="sm" mb={1}>
                      {event.title}
                    </Heading>
                    <HStack>
                      <FiCalendar size={14} />
                      <Text fontSize="sm" color="gray.600">
                        {event.date}
                      </Text>
                    </HStack>
                  </Box>
                  <Box>
                    <Flex align="center" direction="column">
                      <Text fontSize="sm" fontWeight="bold">
                        {event.attendees}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        attendees
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Card p={4} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <CardHeader pb={2}>
            <Heading size="md">Course Management</Heading>
          </CardHeader>
          <CardBody>
            <Text mb={4}>
              Create and manage courses, modules, and learning resources.
            </Text>
            <Button colorScheme="blue" leftIcon={<FiBookOpen />} width="full">
              Manage Courses
            </Button>
          </CardBody>
        </Card>

        <Card p={4} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <CardHeader pb={2}>
            <Heading size="md">Event Administration</Heading>
          </CardHeader>
          <CardBody>
            <Text mb={4}>
              Schedule workshops, webinars, and community events.
            </Text>
            <Button colorScheme="green" leftIcon={<FiCalendar />} width="full">
              Manage Events
            </Button>
          </CardBody>
        </Card>

        <Card p={4} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <CardHeader pb={2}>
            <Heading size="md">Mentorship Program</Heading>
          </CardHeader>
          <CardBody>
            <Text mb={4}>
              Oversee mentor assignments and track mentorship progress.
            </Text>
            <Button colorScheme="purple" leftIcon={<FiUsers />} width="full">
              Manage Mentorship
            </Button>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default AdminDashboard;
