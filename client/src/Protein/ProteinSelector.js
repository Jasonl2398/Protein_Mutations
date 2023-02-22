import { Button, Container, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import ResidueSelector from "./ResidueSelector";
import HeatmapMaker from "./HeatmapMaker";
import ResidueDropdown from "./ResidueDropdown";
import { useNotification } from "../NotificationContext";
import axios from "axios";
import MolstarViewer from "../Molstar/MolstarViewer";
import Mutant from "./Mutant";
import ModeRadio from "./ModeRadio";
import { useNavigate, useLocation } from "react-router";

function ProteinSelector({ protein }) {
  const { setNotification } = useNotification();
  const initialParams = protein.type === "single" ? "" : ["", ""];
  const [index, setIndex] = useState(initialParams);
  const [residue, setResidue] = useState(initialParams);
  const [mode, setMode] = useState("insert");
  const [metric, setMetric] = useState("lrc_dist");
  const [metricValue, setMetricValue] = useState();
  const [residueOpen, setResidueOpen] = useState(false);
  const [mutant, setMutant] = useState();
  const navigate = useNavigate();
  const location = useLocation();

  // Extracts appropriate protein information from URL for direct navigation
  // i.e. localhost:3000/1l2y/single/10/A will fill out state and open mutant dialog
  // Main purpose is for shareable links
  useEffect(() => {
    const residueChain = "([ACDEFGHIKLMNPQRSTVWY])";
    const baseInfo = new RegExp(
      `^/((?:\\w|\\d){4})/(single|pairwise)/?(insert|delete)?/?(.*)`,
      "i"
    );
    // Extract information, index & residue information is inside urlMutant
    let [, urlPdbId, urlType, urlMode, urlMutant] = location.pathname.match(baseInfo);
    urlMutant = urlMutant.toUpperCase();
    // Don't want to set index or residue to undefined
    let urlIndex = initialParams;
    let urlResidue = initialParams;
    let mutantRegEx;
    let mutantInfo;
    // Extract index and residue information from urlMutant based on type & mode
    try {
      if (urlMode === "insert") {
        if (urlType === "single") {
          mutantRegEx = new RegExp(`^(\\d{1,3})/${residueChain}/?$`, "i");
          [, urlIndex, urlResidue] = urlMutant.match(mutantRegEx);
        } else {
          mutantRegEx = new RegExp(
            `^(\\d{1,3})/${residueChain}/(\\d{1,3})/${residueChain}/?$`,
            "i"
          );
          mutantInfo = urlMutant.match(mutantRegEx);
          urlIndex = [mutantInfo[1], mutantInfo[3]];
          urlResidue = [mutantInfo[2], mutantInfo[4]];
        }
        // Delete
      } else if (urlMode === "delete") {
        if (urlType === "single") {
          mutantRegEx = new RegExp("^(\\d{1,3})/?$");
          urlIndex = urlMutant.match(mutantRegEx)[1];
        } else {
          mutantRegEx = new RegExp("^(\\d{1,3})/(\\d{1,3})/?$");
          mutantInfo = urlMutant.match(mutantRegEx);
          urlIndex = [mutantInfo[1], mutantInfo[2]];
        }
      } else {
        if (urlPdbId && urlType) {
          return navigate(`/${urlPdbId}/${urlType}`);
        } else {
          return navigate("/");
        }
      }
      setIndex(urlIndex);
      setResidue(urlResidue);
      setMode(urlMode);
      getMutant(urlMode, urlIndex, urlResidue);
    } catch (error) {
      console.error(error);
      setNotification("There was an error loading protein from URL, redirecting...");
      setTimeout(() => {
        // Navigate to protein page if possible, otherwise dashboard
        if (urlPdbId && urlType) {
          navigate(`/${urlPdbId}/${urlType}`);
        } else {
          navigate("/");
        }
      }, 2500);
    }
  }, []);

  // Only pass position if pairwise
  const handleIndexChange = (value, position) => {
    // Handle single
    if (protein.type === "single") {
      setIndex(value);
      // Handle pairwise
    } else {
      if (position === 0) {
        setIndex((prevValue) => [value, prevValue[1]]);
      } else if (position === 1) {
        setIndex((prevValue) => [prevValue[0], value]);
      }
    }
  };
  // Only pass in position if pairwise
  const handleResidueChange = (value, position) => {
    // Handle single
    if (protein.type === "single") {
      setResidue(value);
      // Handle pairwise
    } else {
      // If in position 1
      if (position) {
        setResidue((prev) => [prev[0], value]);
        // If in position 0
      } else {
        setResidue((prev) => [value, prev[1]]);
      }
    }
  };
  // Residue dropdown change
  const handleResTextChange = (position) => (e) => {
    handleResidueChange(e.target.value, position);
  };

  // Returns true if in bounds, false if not
  const checkBound = (index) => {
    let upperLimit = protein.residue_count;
    if (protein.type != "single") {
      if (mode === "insert") {
        upperLimit += 2;
      }
    }
    else{
      upperLimit += 1;
    }
    console.log("up lim: " + upperLimit);
    return index >= 1 && index <= upperLimit;
  };
  // Confirm navigation to next stage, locks in index/residue
  // For pairwise insert, will render ResidueSelector with new heatmap
  const handleConfirm = async () => {
    // Check index for valid input
    // TODO: Alert user of incorrect input
    // Validate pairwise proteins
    if (protein.type === "pairwise") {
      if (!checkBound(index[0])) {
        return setNotification("First index out of bounds or empty");
      } else if (!checkBound(index[1])) {
        return setNotification("Second index out of bounds or empty");
      } else if (index[0] == index[1]) {
        return setNotification("Indexes should not be equal");
      }
      // Validate single protein
    } else if (!checkBound(index)) {
      return setNotification("Index out of bounds or empty");
    } else if (mode === "insert" && !residue) {
      return setNotification("A residue must be selected");
    }

    // Display next stage for pairwise insert, else final stage
    if (protein.type === "pairwise" && mode === "insert") {
      setResidueOpen(true);
    } else {
      navigate(mutantUrl);
      await getMutant(mode, index, residue);
    }
  };

  // Closes dialog for ResidueSelector
  const handleResidueClose = () => {
    setResidue(initialParams);
    setResidueOpen(false);
  };
  // Closes dialog for Mutant
  const handleMutantClose = () => {
    // Reset state
    setResidue(initialParams);
    setIndex(initialParams);
    setMutant();
    navigate(`/${protein.pdb_id}/${protein.type}`);
    // redirect(`/${protein.pdb_id}/${protein.type}`);
  };

  // Changes mode state of ModeRadio
  const handleModeChange = (e) => {
    setMode(e.target.value);
    setIndex(initialParams);
    setResidue(initialParams);
  };

  // Only for pairwise insert
  const handleResidueConfirm = async () => {
    if (residue[0] && residue[1]) {
      setResidueOpen(false);
      navigate(mutantUrl);
      await getMutant(mode, index, residue);
    } else {
      setNotification("Please select two residues");
    }
  };
  // IIFE for creating mutant url
  const mutantUrl = (() => {
    const orderedIndex = index instanceof Array ? [...index].sort((a, b) => a - b) : index;
    let url = `/${protein.pdb_id}/${protein.type}/${mode}/`;
    if (mode === "insert") {
      if (protein.type === "pairwise") {
        url += `${orderedIndex[0]}/${residue[0]}/${orderedIndex[1]}/${residue[1]}`;
      } else {
        url += `${orderedIndex}/${residue}`;
      }
    } else {
      if (protein.type === "pairwise") {
        url += `${orderedIndex[0]}/${orderedIndex[1]}`;
      } else {
        url += `${orderedIndex}`;
      }
    }
    return url;
  })();

  const getMutant = async (mode, index, residue) => {
    try {
      // Order indexes because database always has lower index first
      const orderedIndex = index instanceof Array ? index.sort((a, b) => a - b) : index;
      const response = await axios.post("/api/get-mutant", {
        pdb_id: protein.pdb_id,
        mode: mode === "insert" ? "ins" : "del",
        type: protein.type,
        // Order index and residue
        index: orderedIndex,
        residue,
      });
      setMutant(response.data);
    } catch (error) {
      console.error(error);
      setNotification("There was an issue retrieving mutant");
    }
  };

  const title =
    mode === "insert"
      ? protein.type === "single"
        ? "Select insert index and residue"
        : "Select insert indexes"
      : protein.type === "single"
      ? "Select delete index"
      : "Select deletion indexes";

  return (
    <Container sx={{ my: 6 }}>
      <Box
        mb={5}
        display="flex"
        flexDirection="column"
        sx={{ justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h4">{title}</Typography>
        <ModeRadio mode={mode} handleModeChange={handleModeChange} />
        <Box display="flex" flexDirection="column">
          {protein && (
            <HeatmapMaker
              protein={protein}
              stage="index"
              mode={mode}
              metric={metric}
              handleIndexChange={handleIndexChange}
              handleResidueChange={handleResidueChange}
              setMetricValue={setMetricValue}
            />
          )}
          <div style={{ marginTop: 16 }} />
          <div>
            {protein.type === "single" ? (
              <TextField
                value={index}
                onChange={(e) => handleIndexChange(e.target.value)}
                inputProps={{ "data-testid": "indexTextField" }}
                variant="outlined"
                name="indexField"
                placeholder="Index"
                sx={{ width: 130 }}
              />
            ) : (
              <>
                <TextField
                  value={index[0]}
                  onChange={(e) => {
                    handleIndexChange(e.target.value, 0);
                  }}
                  inputProps={{ "data-testid": "indexTextField" }}
                  variant="outlined"
                  placeholder="First Index"
                  sx={{ mr: 2, width: 130 }}
                />
                <TextField
                  value={index[1]}
                  onChange={(e) => {
                    handleIndexChange(e.target.value, 1);
                  }}
                  inputProps={{ "data-testid": "indexTextField" }}
                  variant="outlined"
                  placeholder="Second Index"
                  sx={{ width: 130 }}
                />
              </>
            )}
            {protein.type === "single" && mode === "insert" && (
              <ResidueDropdown value={residue} handleChange={handleResTextChange(null)} />
            )}
          </div>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{ mt: 3 }}
            data-testid="generateButton">
            {protein.type === "pairwise" && mode === "insert" ? "Confirm Indices" : "Generate"}
          </Button>
        </Box>
        {/* Make more responsive instead of 50% */}
      </Box>
      <ResidueSelector
        open={residueOpen}
        protein={protein}
        residue={residue}
        mode={mode}
        metric={metric}
        index={index}
        handleChange={handleResTextChange}
        handleResidueChange={handleResidueChange}
        handleClose={handleResidueClose}
        handleConfirm={handleResidueConfirm}
      />
      {mutant && (
        <Mutant
          mutant={mutant}
          type={protein.type}
          handleClose={handleMutantClose}
          mode={mode}
          metric={metric}
          metricValue={metricValue}
        />
      )}
      <MolstarViewer pdbStr={protein.wild_type.pdb_data.pdb} />
    </Container>
  );
}

export default ProteinSelector;
