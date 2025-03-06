import Navbar from "@components/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Custom404() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full shadow-md fixed top-0 left-0 z-50">
        <Navbar user={false} />
      </header>

      <main className="flex flex-grow flex-col items-center justify-center text-center px-6">
        <div className="">
          <h1 className="text-6xl font-bold text-gray-900">Error 404</h1>
          <p className="mt-4 text-2xl text-gray-700">
            Oops! The page you’re looking for doesn’t exist.
          </p>
          <p className="mt-2 text-lg text-gray-500">
            Let’s get you back on track.
          </p>

          <Link
            href="/"
            className="relative px-6 py-4 font-semibold text-white bg-[#f08700] border border-[#f08700] rounded-md transition-all duration-300 hover:bg-[#d67500] hover:border-[#d67500] shadow-[0_0_10px_rgba(240,135,0,0.4)] hover:shadow-[0_0_15px_rgba(240,135,0,0.6)] before:absolute before:inset-0 before:border-2 before:border-[#f08700] before:rounded-md before:opacity-10 before:scale-95 hover:before:scale-100 hover:before:opacity-50 mt-6 inline-flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
