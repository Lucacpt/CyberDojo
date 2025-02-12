const express = require("express");
const UserCourseService = require("../services/userCourseService");
const authenticate = require("../../Middleware/authenticate");

const router = express.Router();

// Get the courses followed by the user
router.get("/", authenticate, async (req, res) => {
  const { username } = req.user;

  try {
    const courses = await UserCourseService.getUserCourses(username);
    res.json(courses);
  } catch (error) {
    console.error("Errore durante il recupero dei corsi seguiti:", error);
    res.status(500).json({ message: "Errore interno del server", error });
  }
});

module.exports = router;
