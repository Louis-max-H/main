//////////////////////////////////////////////////////////////////
///////////////////////////2)Terrain (base)
//////////////////////////////////////////////////////////////////

include("004:terrain_binaire");

function SetDataVoisin() {
	var data = getFilledArray(614, []); //[si fait, [voisin]]
	for (var i = 0; i < 613; i++) {
		for (var deplacement in [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1]
			]) {
			var x = getCellX(i);
			var y = getCellY(i);
			var cell = getCellFromXY(x + deplacement[0], y + deplacement[1]);
			if (cell !== null) {
				push(data[i], cell);
			}
		}
	}
	return data;
}

function SetDataVoisinObstacle() {
	var data = DATA_VOISIN_VIDE; 
	//on enleve les cellules si elle ont pour voisin un obstacle
	for (var obstacle in getObstacles()) {
			var x = getCellX(obstacle);
			var y = getCellY(obstacle);
			for (var deplacement in [
					[1, 0],
					[-1, 0],
					[0, 1],
					[0, -1]
				]) {
				var cell = getCellFromXY(x + deplacement[0], y + deplacement[1]);
				if (cell !== null) {
					var index = search(data[cell], obstacle);
					if (index !== null) {
						remove(data[cell], index);
					}
				} //suppression
			} //chaque voisin
	} //chaque entité
	return data;
}

function MajDataVoisin(data) {
	//on enleve les cellules si elle ont pour voisin un poireau vivant
	for (var entite in getAliveAllies() + getAliveEnemies()) {
		if (entite !== getLeek()) {
			var cell_origine = getCell(entite);
			var x = getCellX(cell_origine);
			var y = getCellY(cell_origine);
			for (var deplacement in [
					[1, 0],
					[-1, 0],
					[0, 1],
					[0, -1]
				]) {
				var cell = getCellFromXY(x + deplacement[0], y + deplacement[1]);
				if (cell !== null) {
					var index = search(data[cell], cell_origine);
					if (index !== null) {
						remove(data[cell], index);
					}
				} //suppression
			} //chaque voisin
		} //!== getleek
	} //chaque entité
	return data;
}

function GetCellRang(cell, rang) {
	//retourne toutes les cellules dans un rang rang autour de la cell cell, correspond à un area_circle
	if (rang === 0) {
		return [cell];
	}
	var xcell = getCellX(cell);
	var ycell = getCellY(cell);
	var resultat = [];
	var y;
	var x;
	for (var i = 0; i < rang; i++) {
		x = xcell - i;
		y = ycell - rang + i;
		if (getCellFromXY(x, y) != null) {
			push(resultat, getCellFromXY(x, y));
		}

		x = xcell - (rang - i);
		y = ycell + i;
		if (getCellFromXY(x, y) != null) {
			push(resultat, getCellFromXY(x, y));
		}

		x = xcell + i;
		y = ycell + (rang - i);
		if (getCellFromXY(x, y) != null) {
			push(resultat, getCellFromXY(x, y));
		}

		x = xcell + (rang - i);
		y = ycell - i;
		if (getCellFromXY(x, y) != null) {
			push(resultat, getCellFromXY(x, y));
		}
	}
	return resultat;
} //MAJ : abs() coute 6 ops

function GetCellCoin(cell, rang) {
	//renvoie les cellules à une distance rang qui sont aligné avec la cell cell (AREA_line)
	if (rang === 0) {
		return [cell];
	}

	var resultat = [];
	var x = getCellX(cell);
	var y = getCellY(cell);
	if (getCellFromXY(x + rang, y) != null) {
		push(resultat, getCellFromXY(x + rang, y));
	}
	if (getCellFromXY(x - rang, y) != null) {
		push(resultat, getCellFromXY(x - rang, y));
	}
	if (getCellFromXY(x, y + rang) != null) {
		push(resultat, getCellFromXY(x, y + rang));
	}
	if (getCellFromXY(x, y - rang) != null) {
		push(resultat, getCellFromXY(x, y - rang));
	}
	return resultat;
}

function GetCellAdjacentLibre(cell){
	var x = getCellX(cell);
	var y = getCellY(cell);
	var resultat = [];
	for (var coos in [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1]
	]) {
		var c = getCellFromXY(x + coos[0], y + coos[1]);
		if (c !== null and isEmptyCell(c)) {
			push(resultat, c);
		}
	}
	return resultat;
}