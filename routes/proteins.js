import express from "express";
import Protein from "../models/protein.js";
import Pairwise from "../models/pairwise.js";
import Single from "../models/single.js";

const router = express.Router();

// Return all information about proteins that should be displayed on the dashboard
router.get("/get-basic-proteins", (req, res) => {
  Protein.find({})
    .then((proteins) => {
      res.status(200).send(proteins);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Could not retrieve protein names!");
    });
});

// Currently only works for pairwise
router.post("/get-mutant", async (req, res) => {
  let { pdb_id, mode, type, index, residue } = req.body;
  // Residue must be undefined for delete operation, otherwise not found
  console.log(req.body);
  residue = mode === "del" ? undefined : residue;
  try {
    let mutant;
    if (type === "single") {
      // Query single collection
      mutant = await Single.findOne({ pdb_id, mode, index, residue }).exec();
    } else if (type === "pairwise") {
      // Query pairwise collection
      mutant = await Pairwise.findOne({ pdb_id, mode, index, residue }).exec();
    } else {
      return res.status(400).send("Invalid request params");
    }
    // Send error if mutant does not exist
    if (mutant) {
      res.status(200).json(mutant);
    } else {
      res.status(404).send("Cannot find mutant");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not retrieve mutant");
  }
  // DO NOT USE PATH until fixed in DB
  // Create regex path
  // let path = `/${pdb_id}/${mode}/`;
  // if (type === "single") {
  //   path += index + "/";
  //   if (mode === "ins") path += residue + "/";
  // } else if (mode === "ins") {
  //   path += `${index[0]}/${residue[0]}/${index[1]}/${residue[1]}/`;
  // } else if (mode === "del") {
  //   path += `${index[0]}/${index[1]}`;
  // } else {
  //   return res.status(400).send("Invalid request params");
  // }
  // path = RegExp(path);
});

export default router;
