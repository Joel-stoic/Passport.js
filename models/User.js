import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Common fields
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents with no email
  },

  // Local auth
  password: {
    type: String,
    minlength: 6,
    required: function () {
      return !this.googleId && !this.facebookId;
    },
  },

  // Social auth
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },

  // Optional field
  profilePicture: String,
});

const User = mongoose.model('User', userSchema);

export default User;
