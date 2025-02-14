import "@css/authentication.css"
import Link from "next/link";
import LogInForm from "./loginForm"

import Navbar from "@components/Navbar"


export default function LogIn() {
    return (
        <div>
            <header>
                <Navbar
                    user={false}
                    navLinks={[
                        { label: "Log In", href: "/login" },
                        { label: "Sign Up", href: "/signup" }
                    ]}
                />
            </header>
            <div>
                < LogInForm />
            </div>
        </div>
    );
}
