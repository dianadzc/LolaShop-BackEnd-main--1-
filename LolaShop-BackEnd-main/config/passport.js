// config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Configuración de la estrategia de Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar si el usuario ya existe por Google ID
        let existingUser = await User.findByGoogleId(profile.id);

        if (existingUser) {
          // Usuario existe, actualizar último login
          await existingUser.updateLastLogin();
          return done(null, existingUser);
        }

        // Verificar si existe un usuario con el mismo email
        const emailUser = await User.findByEmail(profile.emails[0].value);

        if (emailUser) {
          // Vincular cuenta de Google al usuario existente
          emailUser.googleId = profile.id;
          emailUser.provider = "google";
          emailUser.picture = profile.photos[0].value;
          await emailUser.updateLastLogin();
          return done(null, emailUser);
        }

        // Crear nuevo usuario
        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          picture: profile.photos[0].value,
          provider: "google",
        });

        return done(null, newUser);
      } catch (error) {
        console.error("Error en Google Strategy:", error);
        return done(error, null);
      }
    }
  )
);

// Serialización del usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialización del usuario desde la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id); // findByPk en lugar de findById
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
