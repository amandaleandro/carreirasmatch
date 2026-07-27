import Image from "next/image";

export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <Image
      src="/logos/icon-dark.png"
      alt=""
      width={1254}
      height={1254}
      className={`${className} rounded-[22%] object-contain`}
    />
  );
}

export function BrandLogo({
  className = "",
  heightClassName = "h-10",
  onDark = false,
}: {
  className?: string;
  heightClassName?: string;
  /** Use on colored/dark backgrounds where the default light-mode wordmark would be unreadable. */
  onDark?: boolean;
}) {
  if (onDark) {
    return (
      <div className={`flex items-center ${className}`}>
        <Image
          src="/logos/wordmark-dark.png"
          alt="CarreirasMatch"
          width={2508}
          height={627}
          priority
          className={`${heightClassName} w-auto object-contain`}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logos/wordmark-light.png"
        alt="CarreirasMatch"
        width={2508}
        height={627}
        priority
        className={`${heightClassName} w-auto object-contain block dark:hidden`}
      />
      <Image
        src="/logos/wordmark-dark.png"
        alt="CarreirasMatch"
        width={2508}
        height={627}
        priority
        className={`${heightClassName} w-auto object-contain hidden dark:block`}
      />
    </div>
  );
}
