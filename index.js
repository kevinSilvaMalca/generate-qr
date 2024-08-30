const axios = require('axios');
const QRCode = require('qrcode');
const Jimp = require('jimp');
const express = require('express');
const app = express();
const port = 80;

// URL del logo
const logoUrl = 'https://admin.thetriplethree333.com/uploads/image_1_548902308c.png';

app.get('/generate-qr', async (req, res) => {
  try {
    // Obtener el parámetro de consulta
    const qrData = req.query.data || 'https://thetriplethree333.com/card-menu';

    // Descargar la imagen del logo
    const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
    const logoBuffer = Buffer.from(response.data, 'binary');

    // Generar el código QR
    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      width: 600 // Hacer el QR más pequeño
    };
    const qrImageBuffer = await QRCode.toBuffer(qrData, qrOptions);

    // Cargar el QR y el logo usando Jimp
    const qrImage = await Jimp.read(qrImageBuffer);
    const logoImage = await Jimp.read(logoBuffer);

    // Redimensionar el logo para que sea más pequeño que el QR, manteniendo la proporción
    const logoMaxSize = qrImage.bitmap.width / 4;
    logoImage.scaleToFit(logoMaxSize, logoMaxSize);

    // Crear un fondo blanco para el logo
    const whiteBackground = new Jimp(logoImage.bitmap.width, logoImage.bitmap.height, 0xffffffff);
    whiteBackground.composite(logoImage, 0, 0);

    // Calcular la posición para centrar el logo en el QR
    const x = (qrImage.bitmap.width - whiteBackground.bitmap.width) / 2;
    const y = (qrImage.bitmap.height - whiteBackground.bitmap.height) / 2;

    // Insertar el logo con fondo blanco en el QR
    qrImage.composite(whiteBackground, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    });

    // Convertir la imagen final a un buffer
    const finalBuffer = await qrImage.getBufferAsync(Jimp.MIME_PNG);

    // Enviar la imagen como respuesta
    res.set('Content-Type', 'image/png');
    res.send(finalBuffer);
  } catch (error) {
    console.error('Error generating QR code with logo:', error);
    res.status(500).send('Error generating QR code with logo');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});