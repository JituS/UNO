var generateCardsImage = function(color,number){
	var colors = {
		"red":"#e55149",
		"green":"#179741",
		"yellow":"#ffde6b",
		"blue":"#19cad2",
		"null":"#5d5d5d"
	}

	var symbols = {
		0 :0,
		1 :1,
		2 :2,
		3 :3,
		4 :4,
		5 :5,
		6 :6,
		7 :7,
		8 :8,
		9 :9,
		"skip":"&#8416",
		"reverse":"&#10563",
		"plusFour":"\u208A"+"4",
		"plusTwo":"\u208A"+"2",
		"wildCard":"w"
	}

	return ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="150px" height="200px" viewBox="240 170 310 310" preserveAspectRatio="xMidYMid meet" zoomAndPan="disable">',
	'<rect x="255" y="118" rx="20" ry="20" stroke="#26A8FF" id="e1_rectangle" style="stroke-width: 1px; vector-effect: non-scaling-stroke;" width="280" height="420" fill="'+colors[color]+'"/>',
	'<rect x="273" y="135" stroke="white" id="e2_rectangle" style="stroke-width: 2.82px; vector-effect: non-scaling-stroke; fill-opacity: 1;" width="245" height="383" rx="0" ry="0" fill="'+colors[color]+'"/>',
	'<path d="M274,325q0,-190,243,-190" stroke="white" id="e3_arc2" style="fill: none; stroke-width: 2.40px; vector-effect: non-scaling-stroke;"/>',
	'<path d="M518,325q-1,196,-246,190" stroke="white" id="e4_arc2" style="fill: none; stroke-width: 2.40px; vector-effect: non-scaling-stroke;"/>',
	'<text fill="black" x="286" y="191" id="e7_texte" style="font-family: Lucida Sans; font-size: 50px;" stroke="black">',
		symbols[number],
	'</text>',
	'<text fill="black" x="465" y="502.416" id="e11_texte" style="font-family:Lucida Sans; font-size: 57.5517px;" stroke="black">',
		symbols[number],
	'</text>',
	'<text fill="black" x="670" y="232" id="e11_texte" style="font-family:Lucida Sans; font-size: 44px; text-anchor: start; stroke-width: .75px;" transform="matrix(4.20638 0 0 4.76257 -2470.24 -705.223)" stroke="white">',
		symbols[number],
	'</text>',
	'</svg>'].join('');
};