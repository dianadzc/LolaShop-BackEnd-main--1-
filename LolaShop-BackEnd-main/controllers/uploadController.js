const cloudinary = require('../utils/cloudinary');

const uploadImage = async (req, res) => {
  try {
    const file = req.file;

    const result = await cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        return res.status(200).json({ url: result.secure_url });
      }
    );

    file.stream.pipe(result);
  } catch (err) {
    res.status(500).json({ message: 'Error al subir la imagen', error: err });
  }
};

const uploadVideo = async (req, res) => {
  try {
    const file = req.file;

    const result = await cloudinary.uploader.upload_stream(
      { resource_type: 'video' },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        return res.status(200).json({ url: result.secure_url });
      }
    );

    file.stream.pipe(result);
  } catch (err) {
    res.status(500).json({ message: 'Error al subir el video', error: err });
  }
};

module.exports = { uploadImage, uploadVideo };
