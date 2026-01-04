import { verifyToken } from "../utils/jwt.js";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded; // { userId, role }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
