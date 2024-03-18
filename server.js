import express from "express";
import "dotenv/config";
import ApiRoutes from "./routes/api.js";
import expressFileUpload from "express-fileupload";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./config/ratelimiter.js";

const app = express();
const PORT = process.env.PORT || 8000;

//middleware
app.use(express.json()); //parse request body as JSON()
app.use(express.urlencoded({ extended: false })); //Parse URL
app.use(expressFileUpload()); //for file uploading
app.use(express.static("public")); //Serve static files (css  , js)
app.use(helmet());
app.use(cors());
app.use(limiter);

//API routes

app.get("/", (req, res) => {
  return res.json({ message: "hello" });
});

app.use("/api", ApiRoutes);

app.listen(PORT, () => {
  console.log("server is running");
});
