const express = require('express');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../utils/cloudinary');
const router = express.Router();

// Configurar multer para memoria (no archivos en disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📤 Ruta POST para subir imagen a Cloudinary
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }

  const stream = cloudinary.uploader.upload_stream(
    { 
      resource_type: 'image',
      folder: 'lolaShop/imagenes' ,
    },
    (error, result) => {
      if (error) {
        console.error('Error al subir a Cloudinary:', error);
        return res.status(500).json({ error: 'Error subiendo a Cloudinary' });
      }

      res.status(200).json({ url: result.secure_url });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
});

// 📤 Ruta POST para subir video a Cloudinary
router.post('/video', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún video' });
  }

  // Subiendo el video a Cloudinary
  const stream = cloudinary.uploader.upload_stream(
    {
      resource_type: 'video',  // Asegúrate de que se suba como video
      folder: 'lolaShop/videos', // Carpeta en Cloudinary donde se guardará el video
    },
    (error, result) => {
      if (error) {
        console.error('Error al subir el video:', error);
        return res.status(500).json({ error: 'Error subiendo el video a Cloudinary' });
      }

      // Responde con la URL del video subido
      res.status(200).json({ url: result.secure_url });
    }
  );

  // Convertir el archivo en un flujo para que pueda ser subido a Cloudinary
  streamifier.createReadStream(req.file.buffer).pipe(stream);
});

// 📂 Ruta GET para listar imágenes desde Cloudinary
router.get('/list', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:lolaShop/imagenes')
      .sort_by('public_id', 'desc')
      .max_results(30)
      .execute();

    const urls = result.resources.map(file => file.secure_url);
    res.json({ urls });
  } catch (err) {
    console.error('Error obteniendo lista desde Cloudinary:', err);
    res.status(500).json({ error: 'Error obteniendo imágenes desde Cloudinary' });
  }
});

// 📂 Ruta GET para listar videos desde Cloudinary
router.get('/video', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:lolaShop/videos')
      .sort_by('public_id', 'desc')
      .max_results(30)
      .execute();

    const videoUrls = result.resources.map(file => file.secure_url);
    res.json({ videoUrls });
  } catch (err) {
    console.error('Error obteniendo lista de videos desde Cloudinary:', err);
    res.status(500).json({ error: 'Error obteniendo videos desde Cloudinary' });
  }
});

module.exports = router;
