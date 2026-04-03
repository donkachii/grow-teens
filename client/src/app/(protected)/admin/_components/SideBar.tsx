"use client";

import { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { LuFileText } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { HomeIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/utils";
import { usePathname } from "next/navigation";
import { GiBullseye } from "react-icons/gi";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  IconButton,
} from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import { RxHamburgerMenu } from "react-icons/rx";
import Link from "next/link";
import { BiMessageDetail } from "react-icons/bi";
import { FiBookOpen, FiUsers, FiLink } from "react-icons/fi";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon, current: true },
  { name: "User Management", href: "/admin/users", icon: FiUsers, current: false },
  { name: "Program Management", href: "/admin/program", icon: LuFileText, current: false },
  { name: "Course Management", href: "/admin/courses", icon: FiBookOpen, current: false },
  { name: "Canvas Integration", href: "/admin/canvas", icon: FiLink, current: false },
  { name: "Sponsorship Management", href: "/admin/sponsorship", icon: GiBullseye, current: false },
  {
    name: "Message",
    href: "/admin/messages",
    icon: BiMessageDetail,
    current: false,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: IoSettingsOutline,
    current: false,
  },
];

const smVariant = { navigation: "drawer", navigationButton: true };
const mdVariant = { navigation: "sidebar", navigationButton: false };

const SideBar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const variants = useBreakpointValue({ base: smVariant, md: mdVariant });

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return variants?.navigation === "drawer" ? (
    <>
      <Box p={4}>
        <IconButton
          variant="outline"
          aria-label="Menu"
          icon={<RxHamburgerMenu />}
          onClick={toggleSidebar}
        />
      </Box>

      <Drawer isOpen={isSidebarOpen} placement="left" onClose={toggleSidebar}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody>
              <SidebarContent pathname={pathname} />
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  ) : (
    <Box
      display={{ base: "none", lg: "flex" }}
      mt={{ lg: "98px" }}
      position="fixed"
      zIndex={50}
      w="72"
      h="calc(100vh - 98px)"
    >
      <SidebarContent pathname={pathname} />
    </Box>
  );
};

export default SideBar;

const SidebarContent = ({ pathname }: { pathname: string }) => (
  <Box className="flex grow flex-col gap-y-5 md:overflow-y-auto bg-white md:px-6 pb-4 pt-8 md:border-r border-gray-200">
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="-mx-2 space-y-8">
        {navigation.map((item) => {
          const isActive = item.href === pathname;

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={classNames(
                  isActive
                    ? "bg-primary-200 text-primary-500 p-0.5"
                    : "text-gray-500 px-3",
                  "group group-hover:bg-primary-200 flex gap-x-3 items-center rounded-md text-sm font-semibold leading-6"
                )}
              >
                <item.icon
                  aria-label={item.name}
                  className={classNames(
                    isActive
                      ? "text-white bg-primary-500 rounded-full p-2 w-10 h-10"
                      : "text-gray-500 h-6 w-6"
                  )}
                />
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  </Box>
);
