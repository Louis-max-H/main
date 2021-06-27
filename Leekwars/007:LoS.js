//////////////////////////////////////////////////////////////////
///////////////////////////4)Terrain, propagation
//////////////////////////////////////////////////////////////////

include("006:deplacement");

function GetLoS(centre){
	if (DATA_LOS[centre] == 0) {
		DATA_LOS[centre] = [] ;
		for (var r = 0; r <= 8 ; r++) {
			pushAll(DATA_LOS[centre], GetLoSRange(centre,r));
		}
	}
	return DATA_LOS[centre];
}

function reloadLosRang(centre,rang){
	DATA_LOS_RANG[centre][rang] = [];
	var vivant = getAliveAllies() + getAliveEnemies();
	for (var cell in GetCellRang(centre,  rang)) {
		if (lineOfSight(centre, cell, vivant)) {
			push(DATA_LOS_RANG[centre][rang],cell);
		}
	}
	
	//ligne
	var ctr = 0;
	while (ctr < count(DATA_LOS_RANG[centre][rang]) and  isOnSameLine(DATA_LOS_RANG[centre][rang][ctr],centre) ){
		ctr += 1;
	}
	//debug("ctr " +ctr+" centre "+centre+" rang "+rang);
	DATA_LOS_RANG_LIGNE[centre][rang] = ctr;
	//debug("DATA_LOS_RANG_LIGNE[centre][rang] : " + DATA_LOS_RANG_LIGNE[centre][rang]);
}


function GetLoSRange(centre,rang){
	if (DATA_LOS_RANG[centre][rang] == [-1]) {
		reloadLosRang(centre,rang);
	}
	return DATA_LOS_RANG[centre][rang];
}

function GetLosRangeLigne(centre,rang){
	if (DATA_LOS_RANG_LIGNE[centre][rang] === -1) {
		reloadLosRang(centre,rang);
	}
	var resultat = [];
	for (var i = 0; i < DATA_LOS_RANG_LIGNE[centre][rang]; i++) {
		push(resultat, DATA_LOS_RANG[centre][rang][i]);
	}
	return resultat;
}

function GetCellPropagation(mp, cells_debut,los) { //OPTI : mettre 
	var data_voisin = (los) ? @DATA_VOISIN_OBSTACLE : @DATA_VOISIN_VIDE;
	
	var pile = cells_debut;
	var tmp = [];
	var fait = getFilledArray(614, -1);
	var resultat = getFilledArray(mp + 1, []);
	for (var m = 0; m < mp; m++) {
		resultat[m] = pile;
		for (var cell in pile) {
			for (var voisin in data_voisin[cell]) {
				if (fait[voisin] !== m) {
					fait[voisin] = m;
					push(tmp, voisin);
				} //si libre
			} //chaque voisin
		} //pile
		pile = tmp;
		tmp = [];
	} //chaque mp
	resultat[mp] = pile;
	return [resultat, fait];
	//resultat[mp] = *cells
	//fait[cell] = nombre de mp ou -1
}

function GetCellPropagationDirection(mp, cells_debut, direction){
	//GetCellPropagationDirection[mp] = [*cells pouvant être touchées]
	//direction couple +x +y
	var add_x = direction[0];
	var add_y = direction[1];
	var pile = [];
	var resultat = getFilledArray(mp + 1, []);
	resultat[0] = cells_debut;
	for (var cell in cells_debut) {
		push(pile, [getCellX(cell), getCellY(cell)]);
	}
	var tmp = [];
	for (var m = 1; m < mp; m++) {
		for (var coos in pile) {
			var cell = getCellFromXY(coos[0] + add_x, coos[1] + add_y);
			if (cell !== null and isObstacle(cell) === false) {//OPTI : isObstacle : 10ops
				push(tmp, [coos[0] + add_x, coos[1] + add_y]);
				push(resultat[m], cell);
			} //cell existe
		} //pile
		pile = tmp;
		tmp = [];
	} //chaque mp
	return resultat;
}

function GetCellPropagationLigne(mp, cells_debut) { //OPTI : mettre 
	var resultat =  getFilledArray(mp + 1, []);
	for (var direction : var coos in LIGNE_DIRECTION) {
		var tmp = GetCellPropagationDirection(mp, cells_debut, coos);
		for (var m = 0; m < mp; m++) {
			pushAll(resultat[m], tmp[m]);
		}//rang
	}//direction
	return resultat;
	//resultat[mp] = *cells
}

function SetDataLos(cells) {
	var data = getFilledArray(614, 0);
	for (var m in cells[0]) {
		for (var cell in m) {
			for (var los in GetLoS(cell)) {
				data[los] = 1;
			}
		}
	}
	return data;
}


function SetDataLosEnemie() {
	for (var enemie in getAliveEnemies()) {
		var coef = (isSummon(enemie)) ? COEF_LOS_BULBES : COEF_LOS_POIREAUX;
		var ses_mp = getTotalMP(enemie)+1;
		var ses_cell = GetCellAccesibles(ses_mp, getCell(enemie), DATA_VOISIN);
		var Cac = GetCellPropagation(1, ses_cell,true)[1];
		var fait = getFilledArray(614, 0);
		
		//Corps à corps
		for (var cell = 0; cell < 613 ; cell++) {
			if (Cac[cell] !== -1) {
				DATA_LOS_ENEMIE[cell] += 1*COEF_LOS_CAC*coef;
				fait[cell] = 1;
			}
		}
		
		//los
		var aoe = [];
		for (var m = 0; m <= getMP(enemie); m++) {
			for (var cell in ses_cell[0][m]) {
				for (var cell_los in GetLoS(cell)) {
					if (fait[cell_los] == 0) {
						DATA_LOS_ENEMIE[cell_los] += (1 + (ses_mp-m)/ses_mp)/2  * coef;
						push(aoe, cell_los);
						fait[cell_los] = 1;
					} //pas deja fait
				} //ligne de vue
			} //chaque cell
		} //chaque mp
		
		var propagation = GetCellAccesibles(2, aoe, DATA_VOISIN);
		for (var d = 1; d <= 2; d++) {
			for (var cell in propagation[0][d]) {
				DATA_LOS_ENEMIE[cell] = 1 * (0.2*d) * coef;
			}
		}
	} //chaque enemie
} //fct