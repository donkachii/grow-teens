import { v2 as cloudinary } from "cloudinary";

const uploadBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(buffer);
  });
};

export const uploadToCloudinary = async (req, res, next) => {
  try {
    // Multer .single() — e.g. programs (field "image"), modules (field "thumbnail")
    if (req.file?.buffer) {
      const uploaded = await uploadBuffer(req.file.buffer);
      if (
        req.file.fieldname === "thumbnail" ||
        req.file.fieldname === "image" ||
        req.file.fieldname === "file"
      ) {
        req.cloudinaryUrl = uploaded.secure_url;
        req.cloudinaryPublicId = uploaded.public_id;
      }
    }

    if (req.files) {
      // Handle thumbnail if present
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        const thumbnailResult = await uploadBuffer(req.files.thumbnail[0].buffer);
        req.cloudinaryUrl = thumbnailResult.secure_url;
        req.cloudinaryThumbnailId = thumbnailResult.public_id;
      }

      // Handle cover image if present
      if (req.files.coverImage && req.files.coverImage[0]) {
        const coverImageResult = await uploadBuffer(
          req.files.coverImage[0].buffer
        );
        req.coverImageUrl = coverImageResult.secure_url;
        req.cloudinaryCoverImageId = coverImageResult.public_id;
      }

      // Optional: programs route could use fields({ name: 'image' }) later
      if (req.files.image && req.files.image[0]) {
        const imageResult = await uploadBuffer(req.files.image[0].buffer);
        req.cloudinaryUrl = imageResult.secure_url;
        req.cloudinaryPublicId = imageResult.public_id;
      }
    }

    next();
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "Image upload failed",
      details: error.message,
    });
  }
};
