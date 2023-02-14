import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import proteins from "./routes/proteins.js";
import heatmaps from "./routes/heatmaps.js";
import path from "path";

const app = express();
const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();
const env = process.env.NODE_ENV || "development";

app.use(cors());
app.use(express.json());

if (env === "production") {
  app.use(express.static(path.join(__dirname, "/build")));
}

app.use("/api", proteins);
app.use("/api/heatmap", heatmaps);

if (process.env.NODE_ENV === "production") {
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

mongoose.set("strictQuery", true);
mongoose
  .connect(
    `mongodb+srv://AdminDB:csci492@cluster0.wj1zjhz.mongodb.net/ProteinMutations?retryWrites=true&w=majority`,
    {}
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Protein mutations server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
