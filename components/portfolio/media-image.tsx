"use client";
import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { isCloudinaryImage } from "@/lib/cloudinary";
export function MediaImage({
  src,
  alt,
  sizes,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (failed)
    return (
      <span
        className="media-fallback"
        role="img"
        aria-label={`${alt}. Media unavailable`}
      >
        <ImageOff size={28} aria-hidden="true" />
        <span>Media unavailable</span>
      </span>
    );
  return (
    <>
      <span
        className={`media-loading ${loaded ? "loaded" : ""}`}
        aria-hidden="true"
      />
      <Image
        fill
        unoptimized={isCloudinaryImage(src)}
        src={src}
        alt={alt}
        sizes={sizes}
        className={className}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}
