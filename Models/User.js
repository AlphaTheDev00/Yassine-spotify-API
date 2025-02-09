import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email address."],
    unique: true,
    validate: {
      message: "Please enter a valid email.",
      validator: (email) => validator.isEmail(email),
    },
  },

  username: {
    type: String,
    required: [true, "Please provide a username."],
    uniqure: true,
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
          "Password must contain at least 1 lowercase, uppercase, symbol",
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

  bio: {
    type: String,
  },
  profileImage: {
    type: String,
  },
});

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
userSchema.method.isPasswordValid = function (plainTextPassword) {
  const isValid = bcrypt.compareSync(plainTextPassword, this.password);
  console.log(`Password is valid: $isValid`);
  return isValid;
};

const User = mongoose.model("User", userSchema);
export default User;
