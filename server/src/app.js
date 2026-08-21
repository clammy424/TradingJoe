const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const barterRoutes = require("./routes/barterRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log("SERVER RECEIVED:", req.method, req.originalUrl);
    next();
});

app.get("/api/health", (req, res) => {
    console.log("HEALTH ROUTE HIT");
    res.json({
        message: "Backend connected ✓"
    });
});

app.use("/api/auth", authRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/barters", barterRoutes);

app.use("/api/users", userRoutes);

module.exports = app;