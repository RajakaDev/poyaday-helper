const CLOUDINARY_CLOUD_NAME = "dv0b0ygkn";
const CLOUDINARY_UPLOAD_PRESET = "poyaday_unsigned";

export async function uploadImage(file, folder = "poyaday-helper") {
  if (!file) return "";

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  data.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: data,
    }
  );

  const uploaded = await res.json();

  if (!uploaded.secure_url) {
    throw new Error("Image upload failed");
  }

  return uploaded.secure_url;
}