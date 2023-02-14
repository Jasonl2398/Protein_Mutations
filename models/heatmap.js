import mongoose from "mongoose";

const HeatmapSchema = new mongoose.Schema({
  pdb_id: String,
  heatmap: {},
  index: [],
  mode: String,
  type: String,
  metric: String,
});

const heatmap = mongoose.model("Heatmap", HeatmapSchema, "Heatmaps");
export default heatmap;
