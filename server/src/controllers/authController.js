import User from "../models/User.js";

export const login = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: "Login successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to log in",
    });
  }
};
