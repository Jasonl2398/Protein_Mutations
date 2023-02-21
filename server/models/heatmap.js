import mongoose from "mongoose";

const HeatmapSchema = new mongoose.Schema({
  pdb_id: String,
  heatmap: {},
  index: [],
  mode: String,
  type: String,
  metric: String,
  agg_method: String,
});

const heatmap = mongoose.model("Heatmap", HeatmapSchema, "Heatmaps");
export default heatmap;
