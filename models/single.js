import mongoose from "mongoose";

const SingleSchema = new mongoose.Schema({
  mode: String,
  index: Number,
  residue: String,
  pdb_id: String,
  pdb_data: {
    pdb: String,
    rosetta_scores: [
      {
        label: String,
        fa_atr: Number,
        fa_rep: Number,
        fa_sol: Number,
        fa_intra_rep: Number,
        fa_intra_sol_xover4: Number,
        lk_ball_wtd: Number,
        fa_elec: Number,
        pro_close: Number,
        hbond_sr_bb: Number,
        hbond_lr_bb: Number,
        hbond_bb_sc: Number,
        hbond_sc: Number,
        dslf_fa13: Number,
        omega: Number,
        fa_dun: Number,
        p_aa_pp: Number,
        yhh_planarity: Number,
        ref: Number,
        rama_prepro: Number,
        total: Number,
      },
    ],
  },
  hbond_count: Number,
  clusters: [[Number]],
  path: String,
});

const single = mongoose.model("Single", SingleSchema, "Single");
export default single;
