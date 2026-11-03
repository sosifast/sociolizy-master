import Image from "next/image";
import Link from "next/link";

export default function AuthBrand() {
  return (
    <Link
      href="/"
      aria-label="Sociolizy home"
      className="mx-auto mb-5 flex w-fit items-center justify-center rounded-xl bg-white px-3 py-1.5 transition-opacity hover:opacity-80"
    >
      <Image
        src="/logo/logo.png"
        alt="Sociolizy"
        width={164}
        height={61}
        className="h-10 w-auto object-contain"
        priority
      />
    </Link>
  );
}
