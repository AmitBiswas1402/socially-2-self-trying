import Auths from "@/components/Auths";
import { SignUp } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <main className="flex h-screen w-full">
      {/* Sign In */}
      <div className="flex w-full items-center justify-center md:w-1/2">
        <SignUp />
      </div>

      {/* Animated Side */}
      <Auths />
    </main>
  );
};

export default SignInPage;
