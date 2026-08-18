const bcrypt = require("bcrypt");
const User = require("../models/User");

const signup = async (req, res) => {
  try {
    const {
      email,
      password,
      verifyPassword,
      name,
      role,
      gradYear,
    } = req.body;

    // 1. Check required fields
    if (!email || !password || !verifyPassword || !name || !role) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // 2. Check if email already exists and password matches verification
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    if (password !== verifyPassword) {
        return res.status(400).json({
            message: "Passwords do not match",
        });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
      gradYear
    });

    // 6. Send response
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        gradYear: user.gradYear,
        profilePicture: user.profilePicture,
      },
    });

  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "Missing email or password",
        });
    }

    const existingEmail = await User.findOne({ email });
    if (!existingEmail) {
        return res.status(401).json({
            message: "Invalid email or password",
        });
    }

    const isPasswordValid = await bcrypt.compare(password, existingEmail.password);
    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password",
        });
    }

    return res.status(200).json({
        message: "Login successful",
        user: {
            id: existingEmail._id,
            email: existingEmail.email,
            name: existingEmail.name,
            role: existingEmail.role,
            gradYear: existingEmail.gradYear,
            profilePicture: existingEmail.profilePicture,
        },
    });

  } catch (error) {
    console.error("Login error:", error);
    
    return res.status(500).json({
        message: "Server error",
    });
  }
}; 

module.exports = {
  signup,
  login
};