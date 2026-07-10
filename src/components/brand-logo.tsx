export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logos/icon-dark.png"
      alt=""
      className={`${className} rounded-[22%] object-contain`}
    />
  );
}

export function BrandLogo({
  className = "",
  heightClassName = "h-8",
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/wordmark-dark.png"
          alt="CarreirasMatch"
          className={`${heightClassName} w-auto object-contain`}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/wordmark-light.png"
        alt="CarreirasMatch"
        className={`${heightClassName} w-auto object-contain block dark:hidden`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/wordmark-dark.png"
        alt="CarreirasMatch"
        className={`${heightClassName} w-auto object-contain hidden dark:block`}
      />
    </div>
  );
}
