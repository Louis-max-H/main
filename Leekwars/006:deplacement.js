//////////////////////////////////////////////////////////////////
///////////////////////////3)Terrain, déplacement
//////////////////////////////////////////////////////////////////

include("005:terrain_id");

function GetCellAccesibles(mp, cell_debut, voisins) { //OPTI : mettre 
	if (typeOf(cell_debut) == TYPE_NUMBER) {cell_debut = [cell_debut];}

	var fait = getFilledArray(614, -1);
	for (var cell in cell_debut ){
		fait[cell] = 0;
	}
	var pile = cell_debut;
	var tmp = [];
	var resultat = getFilledArray(mp + 1, []);
	for (var m = 0; m < mp; m++) {
		for (var cell in pile) {
			for (var voisin in voisins[cell]) {
				if (fait[voisin] == -1) {
					fait[voisin] = m;
					push(tmp, voisin);
					push(resultat[m], voisin);
				} //si libre
			} //chaque voisin
		} //pile
		pile = tmp;
		tmp = [];
	} //chaque mp
	return [resultat, fait];
	//resultat[mp] = *cells
	//fait[cell] = nombre de mp ou -1
}
function getTerrainDeplacement(){
	var resultat = getFilledArray(614, 0);
	for (var leek in getAliveEnemies()) {
		var fait = getFilledArray(614, false);
		var pile = [getCell(leek)];
		var tmp = [];
		var coef = (isSummon(leek)) ? 0.2 : 1;
		var mp = 0;
		while (isEmpty(pile) == false) {
			for (var cell in pile) {
				for (var voisin in DATA_VOISIN[cell]) {
					if (fait[voisin] === false) {
						fait[voisin] = true;
						resultat[voisin] += mp * coef;
						push(tmp, voisin);
					} //si libre
				} //chaque voisin
			} //pile
			pile = tmp;
			tmp = [];
			mp += 1;
		} //chaque mp
	}
	return resultat;
}

function getCellAccesiblesFlatten(mp, cell_debut, voisins) { //OPTI : mettre 
	var fait = getFilledArray(614, -1);
	fait[cell_debut] = 0;
	var pile = [cell_debut];
	var tmp = [];
	var resultat = [cell_debut];
	for (var m = 0; m < mp; m++) {
		for (var cell in pile) {
			for (var voisin in voisins[cell]) {
				if (fait[voisin] === -1) {
					fait[voisin] = m;
					push(tmp, voisin);
					push(resultat, voisin);
				} //si libre
			} //chaque voisin
		} //pile
		pile = tmp;
		tmp = [];
	} //chaque mp
	return [resultat, fait];
	//resultat[mp] = *cells
	//fait[cell] = nombre de mp ou -1
}


function GetCellPath(cell1, cell2, mp, voisins) { //OPTI : mettre 
	var cells1 = getCellAccesiblesFlatten(mp, cell1, voisins);
	var cells2 = getCellAccesiblesFlatten(mp, cell2, voisins);
	var distance_cell2 = getFilledArray(614, -1);
	var resultat = [];
	for (var cell in cells1[0]) {
		if (cells2[1][cell] !== -1 and cells1[1][cell] + cells2[1][cell] <= mp) {
			push(resultat, cell);
			distance_cell2[cell] = cells1[1][cell] + cells2[1][cell] / 3;
		}
	}
	return [resultat, distance_cell2];
}