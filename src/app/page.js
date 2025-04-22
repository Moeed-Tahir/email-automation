import SignupFlow from "@/components/Signup";
import Image from "next/image";

export default function Home() {
  return (
    <main className="w-full">
      <Image
        src="/email-logo.jpg"
        alt="Email Logo"
        width={500}
        height={500}
        className="absolute top-10 left-10 h-auto object-cover object-center z-10"
      />
      <SignupFlow />
    </main>
  );
}
