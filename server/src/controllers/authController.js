const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const USERNAME_REGEX = /^[^\sA-Z]+$/;

const signup = async (req, res) => {
  try {
    const {
      email,
      password,
      verifyPassword,
      name,
      username,
      role,
      gradYear,
    } = req.body;

    // 1. Check required fields
    if (!email || !password || !verifyPassword || !name || !username || !role) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if (!USERNAME_REGEX.test(username)) {
      return res.status(400).json({
        message: "Username must be lowercase with no spaces",
      });
    }

    // 2. Check if email or username already exists and password matches verification
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(409).json({
        message: "Username already in use",
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
      username,
      role,
      gradYear
    });

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            message: "JWT secret is not configured",
        });
    }

    // 5. Issue auth token so the new user is logged in immediately
    const token = jwt.sign(
        { userID: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    // 6. Send response
    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
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

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            message: "JWT secret is not configured",
        });
    }

    const token = jwt.sign(
        { userID: existingEmail._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return res.status(200).json({
        message: "Login successful",
        token,
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

const logout = async (req, res) => {
  console.log("Logout route hit");
  return res.status(200).json({
    message: "Logout successful",
  });
};

module.exports = {
  signup,
  login,
  logout
};
