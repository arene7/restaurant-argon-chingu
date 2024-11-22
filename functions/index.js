/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
admin.initializeApp();

// Configuración de Nodemailer con Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mparedes20230857@ucsd.edu.do", // Tu correo de Gmail
    pass: "lola0396" // Contraseña de aplicación de Google
  }
});

// Función de Firebase que se activa cuando se crea una nueva reserva
exports.sendConfirmationEmail = functions.firestore
  .document("reservations/{reservationId}")
  .onCreate((snap, context) => {
    const reservation = snap.data();

    // Configuración del correo que se enviará
    const mailOptions = {
      from: "tu-correo@gmail.com",  // Tu correo de Gmail
      to: reservation.email,        // Correo del cliente
      subject: "Confirmación de Reserva - Chingu Bar and Kitchen",
      text: `Hola ${reservation.customerName},\n\nTu reserva para el ${reservation.date} a las ${reservation.time} ha sido recibida correctamente. Espera nuestras noticias para la aprobación.\n\n¡Gracias por tu preferencia!`
    };

    // Enviar el correo de confirmación
    return transporter.sendMail(mailOptions)
      .then(() => {
        console.log("Correo de confirmación enviado.");
        return null;
      })
      .catch((error) => {
        console.error("Error al enviar el correo:", error);
      });
  });
