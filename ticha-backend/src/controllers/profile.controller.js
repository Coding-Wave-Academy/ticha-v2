import {
  createStudentProfile,
  getStudentProfile
} from "../services/studentProfile.service.js";

export const createProfile = async (req, res) => {
  try {
    const profile = await createStudentProfile(req.user.userId, req.body);
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const fetchProfile = async (req, res) => {
  try {
    const profile = await getStudentProfile(req.user.userId);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: "Profile not found" });
  }
};
