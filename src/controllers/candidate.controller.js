import Candidate from "../models/candidate.model.js";

const checkAdminRole = (user) => user.role === "admin";

const createNewCandidate = async (req, res) => {
  try {
    if (!checkAdminRole(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, party, age } = req.body;
    if ([name, party, age].some((field) => !field)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newCandidate = new Candidate({
      name,
      party,
      age,
    });

    const response = await newCandidate.save();

    res.status(200).json({
      message: "Candidate Created Successfully",
      response: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export { createNewCandidate };
