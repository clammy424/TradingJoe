const User = require("../models/User");

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("username name role gradYear");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch user"
    });
  }
};

module.exports = {
  getUserById
};
