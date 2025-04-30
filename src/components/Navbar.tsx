import Link from "next/link";
import Image from "next/image";

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
  return (
    <nav data-testid="nav-bar" className="border-[#00f2ff] bg-gray-900 overflow-hidden top-0 left-0 w-full z-50">
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

        {/* Nav Links */}
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
      </div>
    </nav>
  );
}
