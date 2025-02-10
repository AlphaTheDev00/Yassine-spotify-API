import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username."],
    unique: true
  },

  email: {
    type: String,
    required: [true, "Please provide an email address."],
    unique: true,
    validate: {
      message: "Please enter a valid email.",
      validator: (email) => validator.isEmail(email),
    },
  },

  password: {
    type: String,
    required: [true, "Please provide a password."],
    validate: [
      {
        message: "Password must be at least 8 characters in length.",
        validator: (password) => password.length >= 8,
      },
      {
        message:
          "Password must contain at least 1 lowercase, uppercase, symbol and number",
        validator: (password) =>
          validator.isStrongPassword(password, {
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1,
          }),
      },
    ],
  },

  profileImage: {
    type: String,
  },

  isArtist: {
    type: Boolean,
    required: true
  },

  playlists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  }],

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }]

}, {
  timestamps: true
});

userSchema.set('toJSON', {
  transform(doc, json) {
    delete json.password
  }
})

// Pre-save hook to hash the password before saving
userSchema.pre("save", function (next) {
  // 'this' refers to the document being saved
  if (this.isModified("password")) {
    // Hash the password if its modified
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync());
  }
  next(); //Proceed to save the document
});

// Method to validate if the password matches the stored hash
userSchema.methods.isPasswordValid = function (plainTextPassword) {
  const isValid = bcrypt.compareSync(plainTextPassword, this.password);
  console.log(`Password is valid: ${isValid}`);
  return isValid;
};

const User = mongoose.model("User", userSchema);
export default User;
