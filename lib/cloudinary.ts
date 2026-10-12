const ROOT = "https://res.cloudinary.com/hcn0f9nu";
const publicId = (value: string) =>
  value.split("/").map(encodeURIComponent).join("/");
export function cloudinaryImage(reference: string, width = 384) {
  if (reference.startsWith("https://")) return reference;
  return `${ROOT}/image/upload/c_limit,w_${width}/f_auto/q_auto/v1/${publicId(reference)}`;
}
export function cloudinaryPdf(reference: string) {
  if (reference.startsWith("https://")) return reference;
  return `${ROOT}/image/upload/v1/${publicId(reference.replace(/\.pdf$/i, ""))}.pdf`;
}
export function cloudinaryPdfCover(reference: string) {
  return cloudinaryImage(`${reference.replace(/\.pdf$/i, "")}.jpg`);
}
export function isCloudinaryImage(src: string) {
  return src.startsWith(`${ROOT}/image/upload/`);
}
export function cloudinaryPdfDownload(src: string) {
  return src.startsWith(`${ROOT}/image/upload/`)
    ? src.replace("/image/upload/", "/image/upload/fl_attachment/")
    : src;
}
