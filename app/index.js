const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRouter = require("./routes/auth.router.js");
const connectMongo = require("./db/connectMongo.js");
const User = require("./models/user.model.js");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
connectMongo();

app.use("/", authRouter);

app.post("/loginuser", async (req, res) => {
  const { name, password } = req.body;

  const user = await User.findOne({ name });

  if (!user) {
    return res.status(401).json({ message: "user not found !" });
  }

  if (user.password !== password.trim()) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  const verifiedUser = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    "mysecretekey",
    {
      expiresIn: "1h",
    }
  );

  if (!verifiedUser) {
    return res.status(401).json({ message: "invalid token" });
  }

  res.send({ message: "user logged in", verifiedUser,role:user.role });
});

app.listen(3000, () => {
  console.log("app listening on port 3000!");
});