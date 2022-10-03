import React from "react";


//TODO: Move inline CSS into external CSS file.
export default function References() {
	let link1 = 'https://ieeebibm.org/BIBM2021/';
	
  return (
	<div style={{
		paddingLeft: '20%',
		paddingRight: '20%',
	}}>
		<ul style={{
				fontSize:'30px',
				
			}}
		>
			<li style={{
				margin: '30px 0'
			}}
			>
				Muneeba Jilani, Alistair Turcan, Nurit Haspel, and Filip Jagodzinski. Assessing the Effects of Amino Acid Insertion and Deletion Mutations. Computation Structural Biology Workshop (CSBW), at <a href={link1}> IEEE BIBM 2021</a>
			</li>
			<li>Additional paper pending</li>
		</ul>
	</div>
  );
}