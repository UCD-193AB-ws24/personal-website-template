"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import {
  Menu as MenuIcon,
  LogIn,
  UserRoundPlus,
  LogOut,
  House,
  UserRound,
  File,
  Settings,
} from "lucide-react";
import useIsMobile from "@lib/hooks/useIsMobile";

interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  user?: boolean;
  username?: string;
  onSignOut?: () => void;
  logoHref?: string;
  navLinks?: NavLink[];
}

export default function Navbar({
  user,
  username,
  onSignOut,
  logoHref = "/",
  navLinks = [],
}: NavbarProps) {
  const isMobile = useIsMobile();

  return (
    <nav
      data-testid="nav-bar"
      className="border-[#00f2ff] bg-gray-900 overflow-hidden top-0 left-0 w-full z-50"
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-3">
        {/* Logo */}
        <a
          href={logoHref}
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image src="/logo.png" width={32} height={32} alt="Profesite Logo" />
          <span className="self-center text-4xl font-light tracking-wide whitespace-nowrap text-white iceland-font">
            PROFESITE
          </span>
        </a>

        {/* Hamburger menu for mobile */}
        {isMobile ? (
          <Menu as="div" className="flex items-center">
            <MenuButton>
              <MenuIcon size={24} color="#f08700" />
            </MenuButton>

            {user && onSignOut ? (
              <MenuItems
                anchor="bottom end"
                className="flex flex-col gap-y-3 bg-gray-900 text-white rounded border border-gray-700 py-3 w-[150px]"
              >
                <MenuItem>
                  <Link href="/" className="flex gap-x-2 px-4 items-center">
                    <House size={16} color="gray" />
                    <p className="text-sm">Home</p>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    href="/profile"
                    className="flex gap-x-2 px-4 items-center"
                  >
                    <UserRound size={16} color="gray" />
                    <p className="text-sm">Profile</p>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    href="/saveddrafts"
                    className="flex gap-x-2 px-4 items-center"
                  >
                    <File size={16} color="gray" />
                    <p className="text-sm">Drafts</p>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    href="/profile/settings"
                    className="flex gap-x-2 px-4 items-center"
                  >
                    <Settings size={16} color="gray" />
                    <p className="text-sm">Settings</p>
                  </Link>
                </MenuItem>

                {/* Horizontal divider */}
                <div className="flex justify-center">
                  <div className="border-t-[1px] border-gray-700 w-[90%]"></div>
                </div>

                <MenuItem>
                  <button
                    onClick={onSignOut}
                    className="flex gap-x-2 px-4 items-center"
                  >
                    <LogOut size={16} color="gray" />
                    <p className="text-sm">Sign out</p>
                  </button>
                </MenuItem>
              </MenuItems>
            ) : (
              <MenuItems
                anchor="bottom end"
                className="flex flex-col gap-y-3 bg-gray-900 text-white rounded border border-gray-700 py-3 w-[150px]"
              >
                <MenuItem>
                  <Link
                    href="/login"
                    className="flex gap-x-2 px-4 items-center"
                  >
                    <LogIn size={16} color="gray" />
                    <p className="text-sm">Log in</p>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    href="/signup"
                    className="flex gap-x-2 px-4 items-center"
                  >
                    <UserRoundPlus size={16} color="gray" />
                    <p className="text-sm">Sign up</p>
                  </Link>
                </MenuItem>
              </MenuItems>
            )}
          </Menu>
        ) : (
          // Nav links for non-mobile view
          <div className="flex w-auto space-x-8 items-center">
            {user && (
              <div className="text-white font-medium text-lg">
                {username ? username : "Loading..."}
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-6 py-2.5 text-large font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black shadow-md hover:shadow-lg"
              >
                {link.label}
              </Link>
            ))}

            {/* Log Out Button (Only if User is Logged In) */}
            {user && onSignOut && (
              <button
                onClick={onSignOut}
                className="relative px-5 py-2.5 font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black"
              >
                Log Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
