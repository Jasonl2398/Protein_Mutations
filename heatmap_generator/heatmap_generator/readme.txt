The scripts included in this folder are modified versions of a script that was developed by the previous group that worked on the protein mutations senior project. The original script and data were provided by Filip Jagodzinski.

NOTE: Protein data that is required for the scripts to run is not provided in this folder. It is locked in a limited-access filesystem.

heatmap.py - generates index of indel x index of indel heatmaps for pairwise and single indels (insertions and deletions). 

heatmap_resbyindex.py - generates residue x index of insertion heatmaps for single insertions.

heatmap_resbyres - generates residue x residue with a given set of indices for pairwise insertions



Setup:

(1) Install Python3 on your machine:

(2) Create a Python virtual environment in the heatmap_generator folder (see https://docs.python.org/3/library/venv.html for instructions on how to setup a virtual environment)
 
(3)Start your Python venv via:

Navigating to heatmap_generator folder in cmd (which should now contain the venv folder)
./env/Scripts/activate 

(4) Install dependencies once virtual environment is activated:

pip install seaborn
pip install matplotlib
pip install numpy
pip install biopython

(6) Choose a script to run:
(Ex.) python ./heatmap.py

Each script outputs heatmaps and their raw data into their respective folders
NOTE: At the moment only folders for protein '1l2y' are provided.