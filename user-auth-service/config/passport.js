// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const User = require("../models/User");

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback"
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       const email = profile.emails[0].value;

//       // Find user registered already (by institution representative)
//       const user = await User.findOne({ email });

//       if (!user) {
//         return done(null, false); // Not found → block login
//       }

//       return done(null, user); // Found → login success
//     } catch (err) {
//       return done(err, false);
//     }
//   }
// ));
