import { ThemeProvider } from "@mui/material";
import "./App.css";
import NavBar from "./NavBar";
import Dashboard from "./Dashboard";
import theme from "./theme";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Info from "./Info";
import References from "./References";
import ProteinPage from "./Protein/ProteinPage";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [proteins, setProteins] = useState([]);

  // Retrieve data from database
  useEffect(() => {
    const getProteinNames = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/get-basic-proteins");
        setProteins(response.data);
      } catch (error) {
        console.error(error);
        // Notify the user somehow
      }
    };

    getProteinNames();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");

    script.src = "./molstar-viewer/molstar.min.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="" element={<NavBar />}>
              <Route index element={<Dashboard proteins={proteins} />} />
              <Route
                path="info"
                element={
                  <div>
                    <Info /> <References />{" "}
                  </div>
                }
              />
              {
                //Generate routes from proteins
                proteins.map((protein) => {
                  return (
                    <Route
                      key={protein.pdb_id}
                      path={protein.pdb_id}
                      element={<ProteinPage {...protein} />}
                    />
                  );
                })
              }
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
