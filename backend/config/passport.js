import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import crypto from 'crypto';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_URL 
      ? `${process.env.BACKEND_URL}/api/auth/google/callback` 
      : "/api/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // 1. Check if user exists with googleId
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }

      // 2. Check if user exists with email
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        // Link potential googleId if not present
        if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
        }
        return done(null, user);
      }

      // 3. Create new user
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let registerId = '';
      for (let i = 0; i < 6; i++) {
        registerId += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Ensure registerId is unique (simple check, rare collision)
      while(await User.findOne({ registerId })) {
        registerId = '';
        for (let i = 0; i < 6; i++) {
            registerId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }

      const newUser = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        password: crypto.randomBytes(32).toString('hex'), // Random secure password
        registerId: registerId,
        role: 'customer'
      });

      return done(null, newUser);

    } catch (err) {
      console.error(err);
      return done(err, null);
    }
  }
));

export default passport;
