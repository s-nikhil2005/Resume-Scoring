import AuthHeader from "@/components/auth/AuthHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
}