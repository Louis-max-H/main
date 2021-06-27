//////////////////////////////////////////////////////////////////
///////////////////////////1)Terrain (binaire)
//////////////////////////////////////////////////////////////////

include("003:profiling");

function TerrainVide() {//on fait terrain[ligne] & 1<< colonne
	return getFilledArray(35,0);
}

function GetIDCell(x, y) {
	return 306 + 18 * x + 17 * y;
}

function GetCellLigne(x, y) {//renvoie la possition de la ligne 
	return x + y + 17;
}

function GetCellColonne(x, y) {//renvoie la position de la colonne
	return floor((x - y + 17) / 2);
}

function TerrainGetCell(x, y, terrain) { // -17 <= x,y <= 17
	return terrain[GetCellLigne(x, y)] & 1 << GetCellColonne(x, y);
}

function TerrainSetCell(x, y, terrain, etat) { // -17 <= x,y <= 17
	var ligne = GetCellLigne(x, y);
	var colonne = GetCellColonne(x, y);
	terrain[ligne] |=  1 << colonne;
	if (etat == 0) {
		terrain[ligne] ^= 1 << colonne;
	}
}

function TerrainAfficher(terrain, couleur) {
	//marque chaque case du terrain binaire avec la couleur couleur
	for (var i = 0; i < 613; i++) {
		var x = getCellX(i);
		var y = getCellY(i);
		if (TerrainGetCell(x, y, terrain) != 0) {
			mark(i,couleur);
		}
	}
}

function TerrainReset() {
	//marque en blanc tout le terrain
	for (var id = 0; id < 613; id++) {
		mark(id, COLOR_BLANC);
	}
}

//fonctions plus évolué (obstacle, déplacement)
function TerrainObstacles() {
	//renvoie les obstacle sous forme d'un tableau binaire
	var terrain = TerrainVide();
	for (var obstacle in getObstacles()) {
		var x = getCellX(obstacle);
		var y = getCellY(obstacle);
		terrain[GetCellLigne(x,y)] |= 1 << GetCellColonne(x,y);
	}
	//TerrainAfficher(terrain,  getColor(255, 255, 0));
	return terrain;
}

function TerrainAppliquerBorne(terrain) {
	//applique des bornes au terrain de manière à ne pas avoir de bits qui sort du terrain
	for (var pos = 0; pos < 35; pos++) {
		var taille = (pos % 2 == 0) ? 18 : 17;
		if (terrain[pos] & 1 << taille != 0) {
			terrain[pos] ^=  1 << taille;
		}
	}
}

function TerrainAppliquerObstacle(terrain, obstacles) {
	for (var pos = 0; pos < 35; pos++) {
		var t = terrain[pos] & obstacles[pos];
		terrain[pos] = terrain[pos] ^ t;
	}
}

function GetCellAccesiblesBinaire(mp, cell_debut, obstacles) {
	//calcule des cellules en binaire
	var terrain = TerrainVide();
	var x = getCellX(cell_debut);
	var y = getCellY(cell_debut);
	terrain[GetCellLigne(x, y)] = 1 << GetCellColonne(x,  y);
	var tmp;
	for (var m = 0; m < mp; m++) {
		tmp = terrain;

		for (var pos = 0; pos < 35; pos++) {
			if (pos%2 == 0) {//ligne de taille 18
				if (pos !== 0) {
					tmp[pos] |= terrain[pos - 1];
					tmp[pos] |= terrain[pos - 1] << 1;
				}
				if (pos !== 34) {
					tmp[pos] |= terrain[pos + 1];
					tmp[pos] |= terrain[pos + 1] << 1;
				}
			}else{
				if (pos !== 0) {
					tmp[pos] |= terrain[pos - 1];
					tmp[pos] |= terrain[pos - 1] >> 1;
				}
				if (pos !== 34) {
					tmp[pos] |= terrain[pos + 1];
					tmp[pos] |= terrain[pos + 1] >> 1;
				}			
			}//fin type ligne
		}//fin chaque lignes
		TerrainAppliquerBorne(tmp);
		TerrainAppliquerObstacle(tmp,TerrainObstacles());
		terrain = tmp;
	}//fin mp
	return terrain;
}