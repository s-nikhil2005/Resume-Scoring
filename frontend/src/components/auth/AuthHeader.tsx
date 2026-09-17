import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="w-full bg-stone-100">
      <div className="flex h-16 items-center px-5">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-stone-900"
        >
          Developer<span className="text-blue-600">Tool</span>
        </Link>
      </div>
    </header>
  );
}