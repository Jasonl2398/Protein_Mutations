import express from "express";
import Protein from "../models/protein.js";
import Heatmap from "../models/heatmap.js";

const router = express.Router();

router.post("/get-heatmap", async (req, res) => {
  try {
    const { pdb_id, type, index, mode, metric } = req.body;
    console.log(req.body);
    const heatmap = await Heatmap.findOne({ pdb_id, type, index, mode, metric }).exec();
    res.status(200).json(heatmap);
  } catch (error) {
    console.error("Could not retrieve heatmap");
    res.status(500).send("Could not retrieve heatmap");
  }
});

export default router;
