import SignUpForm from "./signupForm";
import Navbar from "@components/Navbar";

export default function SignUp() {
  return (
    <div>
      <header>
        <Navbar
          user={false}
          navLinks={[
            { label: "Log In", href: "/login" },
            { label: "Sign Up", href: "/signup" },
          ]}
        />
      </header>

      <div>
        <SignUpForm />
      </div>
    </div>
  );
}
