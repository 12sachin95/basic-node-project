import express from "express";
import "dotenv/config";
import ApiRoutes from "./routes/api.js";
import expressFileUpload from "express-fileupload";

const app = express();

//middleware
app.use(express.json()); //parse request body as JSON()
app.use(express.urlencoded({ extended: false })); //Parse URL
app.use(expressFileUpload()); //for file uploading
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  return res.json({ message: "hello" });
});

app.use("/api", ApiRoutes);

app.listen(PORT, () => {
  console.log("server is running");
});
