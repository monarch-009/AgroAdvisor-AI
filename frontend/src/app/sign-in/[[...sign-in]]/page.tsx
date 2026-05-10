import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center">
        <SignIn appearance={{ elements: { card: "shadow-2xl shadow-green-900/5 border border-gray-100" } }} />
      </div>
    </div>
  );
}
