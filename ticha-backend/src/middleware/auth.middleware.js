import { verifyToken } from "../utils/jwt.js";
import fs from "fs";
import path from "path";

export const protect = (req, res, next) => {
  // #region agent log
  const logPath = path.join(process.cwd(), '.cursor', 'debug.log');
  const logData = {location:'auth.middleware.js:4',message:'protect middleware entry',data:{hasAuthHeader:!!req.headers.authorization,path:req.path,method:req.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
  fs.appendFileSync(logPath, JSON.stringify(logData) + '\n');
  // #endregion
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // #region agent log
      const logData2 = {location:'auth.middleware.js:9',message:'No auth header',data:{hasAuthHeader:!!authHeader,startsWithBearer:authHeader?.startsWith("Bearer ")},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      fs.appendFileSync(logPath, JSON.stringify(logData2) + '\n');
      // #endregion
      return res.status(401).json({ error: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    // #region agent log
    const logData3 = {location:'auth.middleware.js:14',message:'Before verifyToken',data:{tokenLength:token?.length,hasToken:!!token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
    fs.appendFileSync(logPath, JSON.stringify(logData3) + '\n');
    // #endregion
    const decoded = verifyToken(token);
    // #region agent log
    const logData4 = {location:'auth.middleware.js:16',message:'Token verified',data:{userId:decoded?.userId,role:decoded?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
    fs.appendFileSync(logPath, JSON.stringify(logData4) + '\n');
    // #endregion

    req.user = decoded; // { userId, role }

    next();
  } catch (err) {
    // #region agent log
    const logPath2 = path.join(process.cwd(), '.cursor', 'debug.log');
    const logData5 = {location:'auth.middleware.js:20',message:'protect middleware error',data:{errorMessage:err.message,errorName:err.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
    fs.appendFileSync(logPath2, JSON.stringify(logData5) + '\n');
    // #endregion
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
