const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();
console.log("STARTING THIS SERVER FILE");
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
