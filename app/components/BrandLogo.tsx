import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
    href?: string;
    className?: string;
    imageClassName?: string;
    alt?: string;
    priority?: boolean;
};

export default function BrandLogo({
    href = "/",
    className = "w-[220px] h-[86px]",
    imageClassName = "object-contain",
    alt = "Whiteheart logo",
    priority = true,
}: BrandLogoProps) {
    return (
        <Link
            href={href}
            aria-label={alt}
            className={`relative inline-block ${className}`}
        >
            <Image
                src="/WH-NEW-LOGO-transparent.png"
                alt={alt}
                fill
                priority={priority}
                sizes="(max-width: 768px) 180px, 220px"
                className={imageClassName}
            />
        </Link>
    );
}