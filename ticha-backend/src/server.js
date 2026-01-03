import "./config/env.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TICHA backend running on port ${PORT}`);
});
