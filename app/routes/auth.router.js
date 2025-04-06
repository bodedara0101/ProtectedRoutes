const express = require("express");
const router = express.Router();
const verifyRole = require("../middleware/auth.middleware.js");
const User = require("../models/user.model.js");

router.get("/users", verifyRole, async (req, res) => {
  console.log(req.user);
  const users = await User.find({});
  if (users.length > 0) {
    res.json({ message: "Authorized", users });
  } else {
    res.json("No users found");
  }
});

router.delete("/deleteuser/:id", verifyRole, async (req, res) => {
  console.log(req.user);

  const able = {
    admin: 1,
    manager: 2,
    user: 3,
  };

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  //make a priority based authorization

  if (req.user.id === user.id) {
    return res.status(400).json({ message: "You can not delete yourself" });
  }

  if (able[req.user.role] >= able[user.role]) {
    res
      .status(400)
      .json({ message: "You are not authorized to delete this user" });
  } else {
    await User.findByIdAndDelete(req.params.id);
    res.json({
      message: `user with id ${req.params.id} deleted by ${req.user.role}`,
    });
  }
});

router.post("/createuser", verifyRole, async (req, res) => {
  console.log(req.user);
  try {
    const { name, password, email } = req.body;
    console.log(req.body);
    const user = await User.create({
      name,
      email,
      password,
    });

    const result = await user.save();

    if (result) {
      res.json({
        message: `user with id ${user._id} created by ${req.user.role}`,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/edituser/:id", verifyRole, async (req, res) => {
  
  try {
    const able = {
      admin: 1,
      manager: 2,
      user: 3,
    };

    const puser = await User.findById(req.params.id);

    //make a priority based authorization

  if (req.user.id === puser.id) {
    return res.status(400).json({ message: `You can not edit yourself` });
  }

  if (able[req.user.role] >= able[puser.role]) {
    res
      .status(400)
      .json({ message: `You are not authorized to edit this user` });
  } else {
    const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true});
    if(!user){
      res.json({message : "user not found !"})
    }

    let changes = {};
    Object.keys(req.body).forEach((key) => {
      if (puser[key] !== user[key]) {
        changes[key] = `${puser[key]} changes in ${user[key]}`
      }
    });
    res.json({
      message: "User updated successfully",
      changes,
      updatedUser: user,
    });
  }

  } catch (error) {
    res.json({message : error.message})
  }
});

module.exports = router;
