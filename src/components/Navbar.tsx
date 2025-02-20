import Link from "next/link";
import Image from "next/image";

interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  user?: boolean;
  onSignOut?: () => void;
  logoHref?: string;
  navLinks?: NavLink[];
}

export default function Navbar({ user, onSignOut, logoHref = "/", navLinks = [] }: NavbarProps) {
  return (
    <nav className="border-[#00f2ff] bg-gray-900 overflow-hidden top-0 left-0 w-full z-50">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-3">
      {/* Logo */}
        <a href={logoHref} className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="/logo.png" width={32} height={32} alt="Profesite Logo" />
          <span className="self-center text-4xl font-light tracking-wide whitespace-nowrap text-white iceland-font">
            PROFESITE
          </span>
        </a>

      {/* Nav Links */}
        <div className="md:flex md:w-auto space-x-8">
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
              className="relative px-5 py-2.5 font-semibold text-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#f08700] hover:text-black shadow-[0_0_8px_rgba(240,135,0,0.4)] hover:shadow-[0_0_12px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50"
            >
              Log Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
