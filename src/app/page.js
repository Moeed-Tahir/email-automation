import EmailAuthorize from "./EmailAuthorize";
import LinkedInLogin from "./LinkedInLogin";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <>
      {/* <LinkedInLogin/> */}
      <EmailAuthorize/>
      </>
    </main>
  );
}
