import type { CSSProperties, ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string | { src: string };
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  unoptimized?: boolean;
  placeholder?: string;
};

/** Stand-in for next/image: a plain <img>. The app ships its images inside the bundle, so no optimiser is needed. */
export default function Image({ src, fill, priority, quality, unoptimized, placeholder, sizes, style, alt = "", ...rest }: Props) {
  void priority, quality, unoptimized, placeholder, sizes;
  const url = typeof src === "string" ? src : src.src;
  const merged: CSSProperties | undefined = fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style;
  return <img src={url.startsWith("/") ? "." + url : url} alt={alt} style={merged} decoding="async" {...rest} />;
}
