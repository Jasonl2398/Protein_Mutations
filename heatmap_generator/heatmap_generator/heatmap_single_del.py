
import os
import pdb #python debugger
from collections import defaultdict
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import json
import sys
from json import JSONEncoder
from Bio.PDB import *
from Bio import PDB

file_path = '\\results\\del\\'
def get_residue_count(pdb_id):
    # get pdb file and structure
    pdb_file = PDBList().retrieve_pdb_file(pdb_id)
    structure = PDBParser().get_structure(pdb_id, pdb_file)
    model =  PDB.MMCIF2Dict.MMCIF2Dict(pdb_file)
    # if field (sequence) exists in the model then return the length
    if '_entity_poly.pdbx_seq_one_letter_code' in model.keys():
        full_struct = (model['_entity_poly.pdbx_seq_one_letter_code'])
        print("Residue count length: " + str(len((full_struct[0]))))
        return len((full_struct[0]))

def get_wild_type(pdb_id):
    file = open(pdb_id + '_Single' +'\\wild_type.json')
    wild_data = json.load(file)
    file.close()
    return wild_data


#for SINGLE deletions
def load_mutants(pdb_id, pos1, pos2):

    mut_data = []
    json_dir = pdb_id +'_Single'+ '\\results\\del\\' + str(pos2) + '.json'

    try:
        file = open(json_dir)
        print(json_dir)
        mut_data.append(json.load(file))
    except Exception as e:
        print('SKIPPED: '+json_dir) 
    return mut_data

# remove '.json' from a list of filenames
def trim_file_string(name_list):
    new_list = []
    for name_index in range(len(name_list)):
        new_list.append(name_list[name_index].replace('.json',''))
    return new_list

def get_name_list(dir):
    name_list = os.listdir(dir)
    return name_list

def iterate_cells(rescount):
    file_dir = pdb_id +'_Single'+ '\\results\\del\\'
    name_list = get_name_list(file_dir)
    print(name_list)
    pos1 = 0
    for pos2 in range(1,rescount+1):
        # load all mutants for this position
        mutants = load_mutants(pdb_id,pos1,pos2)
        yield (pos1, pos2, mutants)


# need to modify to create residue x residue plots for 
def update_data(pos1, pos2, mut_types, wild_type, data):
    def update_cell(cell, pos1, pos2, val):
        cell[pos1][pos2] = val
     
    def count_outliers(vals, zscore):
        mean = np.mean(vals)
        std = np.std(vals)
        return sum(1 for val in vals if abs(val - mean) / std >= zscore)

    hbond_count_ratio = [mut['hbond_count'] / wild_type['hbond_count'] for mut in mut_types] # mut_types should be an array of json files(?)
    update_cell(data['hbond_count_ratio']['avg'], pos1, pos2, np.mean(hbond_count_ratio))

    '''
    update_cell(data['hbond_count_ratio']['std'], pos1, pos2, np.std(hbond_count_ratio))
    update_cell(data['hbond_count_ratio']['1sd_outlier'], pos1, pos2, count_outliers(hbond_count_ratio, 1))
    update_cell(data['hbond_count_ratio']['3sd_outlier'], pos1, pos2, count_outliers(hbond_count_ratio, 3))
    '''

    lrc_dist = [wild_type['kinari_metrics']['size of largest Clust'] - mut['kinari_metrics']['size of largest Clust'] for mut in mut_types]
    update_cell(data['lrc_dist']['avg'], pos1, pos2, np.mean(lrc_dist))

    '''
    update_cell(data['lrc_dist']['std'], pos1, pos2, np.std(lrc_dist))
    update_cell(data['lrc_dist']['1sd_outlier'], pos1, pos2, count_outliers(lrc_dist, 1))
    update_cell(data['lrc_dist']['3sd_outlier'], pos1, pos2, count_outliers(lrc_dist, 3))
    '''

    clust_config_entropy_diffs = [mut['kinari_metrics']['Cluster configuration entropy'] - wild_type['kinari_metrics']['Cluster configuration entropy'] for mut in mut_types]
    update_cell(data['cce_difference']['avg'], pos1, pos2, np.mean(clust_config_entropy_diffs))

    '''
    update_cell(data['cce_difference']['std'], pos1, pos2, np.std(clust_config_entropy_diffs))
    update_cell(data['cce_difference']['1st_outlier'], pos1, pos2, count_outliers(clust_config_entropy_diffs,1))
    update_cell(data['cce_difference']['3sd_outlier'], pos1, pos2, count_outliers(clust_config_entropy_diffs,3))
    '''

    update_cell(data['mutation']['count'], pos1, pos2, len(mut_types))

    for rosetta_key in wild_type['pdb_data']['rosetta_scores'][0]:
        if rosetta_key in ('label', 'total'):
            continue
        wt_scores = []
        for i in range(2, len(wild_type['pdb_data']['rosetta_scores'])): # skip header & column
            wt_res_score = wild_type['pdb_data']['rosetta_scores'][i][rosetta_key]
            if type(wt_res_score) is str:
                wt_res_score = float(wt_res_score)
            wt_scores.append(wt_res_score)
        wt_avg_score = np.mean(wt_scores)

        wt_mut_diff_scores = []
        mut_avg_scores = []
        for mut in mut_types:
            mut_scores = []

            for i in range(1, len(mut['pdb_data']['rosetta_scores'])):
                mut_res_score = mut['pdb_data']['rosetta_scores'][i][rosetta_key]
                if type(mut_res_score) is str:
                    mut_res_score = float(mut_res_score)
                mut_scores.append(mut_res_score)

            mut_avg_score = np.mean(mut_scores)

            mut_avg_scores.append(mut_avg_score)
            wt_mut_diff_scores.append(wt_avg_score - mut_avg_score)

        update_cell(data[f'rosetta_{rosetta_key}_mut']['avg'], pos1, pos2, np.mean(mut_avg_scores))
        update_cell(data[f'rosetta_{rosetta_key}_wt_diff']['avg'], pos1, pos2, np.mean(wt_mut_diff_scores))


    rigid_cluster_count_diffs = []
    for mut in mut_types:
        cluster_count = min(len(wild_type['clusters']), len(mut['clusters']))
        cluster_diff = sum(len(wild_type['clusters'][i]) - len(mut['clusters'][i]) for i in range(cluster_count))
        rigid_cluster_count_diffs.append(cluster_diff)
    
    update_cell(data['rcbd']['avg'], pos1, pos2, np.mean(rigid_cluster_count_diffs))
    '''
    update_cell(data['rcbd']['std'], pos1, pos2, np.std(rigid_cluster_count_diffs))
    update_cell(data['rcbd']['1sd_outlier'], pos1, pos2, count_outliers(rigid_cluster_count_diffs, 1))
    update_cell(data['rcbd']['3sd_outlier'], pos1, pos2, count_outliers(rigid_cluster_count_diffs, 3))
    '''

def create_heatmap(data, pdb_id, arr_count, name, name_list):
    
    plt.clf()
    plt.title(f"{pdb_id}_{name}")


    mask = np.zeros_like(data)
    ax = sns.heatmap(data, mask=mask, cmap='hot', cbar_kws={'label': name})

    ax.invert_yaxis()

    #ax.set_yticklabels(name_list)

    ax.set_facecolor("black") # fill in masked cells with black

    ax.set_xlabel("Deletion index")
    ax.set_ylabel("Measured change")

    # dump raw heatmap data for future generation
    # need to dump these in separate folders
    data = np.delete(data,0)
    dump_dir = '1l2y_SingleDelArr_ind\\' # directory for where the heatmap arrays are dumped
    dictionary = {
        "heatmap": data.tolist(),
        "pdb_id" : pdb_id,
        "mode" : "del",
        "type" : "ind",
        "metric" : metric,
        "agg_method" : agg_method
    }
    
    array_dump = json.dumps(dictionary,indent=4)
    array_dump = array_dump.replace("NaN","null")
    with (open(dump_dir + pdb_id + '_' + name + '_arr.json','w')) as f:
        f.write(array_dump)

    plt.savefig(f"metrics_single_del/{pdb_id}_{name}.png")

# driver code
if __name__ == '__main__':
    
    pdb_id = '1l2y'

    print("Fetching wild type")
    wild_type = get_wild_type(pdb_id)

    print("Fetching residue count")
    rescount = get_residue_count(pdb_id)

    print("Fetching residue names")
    dir = pdb_id +'_Single'+'\\results\\del\\'
    name_list = trim_file_string(get_name_list(dir))

    heatmap_data = defaultdict(lambda: defaultdict(lambda: np.zeros(shape=(1,rescount+1)))) 

    print("Building data")
    '''
    pos1: int for position of first indel
    pos2: int for position of second indel
    docs: loaded mutants retrieved w/ load_mutants()
    '''
    for pos1, pos2, docs in iterate_cells(rescount):
        update_data(pos1, pos2, docs, wild_type, heatmap_data)
        
    print("Creating heatmaps")
    for metric in heatmap_data:
        arr_count = 0
        for agg_method in heatmap_data[metric]:
            arr_count += 1
            create_heatmap(heatmap_data[metric][agg_method], pdb_id, arr_count, f"{metric}_{agg_method}",name_list)





