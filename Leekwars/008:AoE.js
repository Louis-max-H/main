//////////////////////////////////////////////////////////////////
///////////////////////////2)AoE
//////////////////////////////////////////////////////////////////

include("007:LoS");

function SetDataAOE() {
	//GetAOE(cell)[type]=[[id-entité,%], ... ] 
	//AREA_LASER_LINE n'est pas prise en compte
	var leeks = getAliveAllies();
	pushAll(leeks, getAliveEnemies());
	for (var entity in leeks) {
		if (entity !== getLeek()) {
			var coef_entite = getCoef(entity);
			var sa_cell = getCell(entity);

			//AREA_CIRCLE_?
			for (var area: var rayon in [
					AREA_POINT: 0,
					AREA_CIRCLE_1: 1,
					AREA_CIRCLE_2: 2,
					AREA_CIRCLE_3: 3
				]) {
				for (var rang = 0; rang <= rayon; rang++) {
					var coef = coef_entite * (1 - (0.2 * rang));
					for (var cell in GetCellRang(sa_cell, rang)) {
						push(DATA_AOE[cell][area], [entity, coef]);
						DATA_AOE_SCORE[cell][area] += coef;
					} //cell
				} //rayon
			} //area_circle

			//AREA_PLUS_?
			for (var area: var rayon in [
					AREA_PLUS_2: 2,
					AREA_PLUS_3: 3,
				]) {
				for (var rang = 0; rang <= rayon; rang++) {
					var coef = coef_entite * (1 - (0.2 * rang));
					for (var cell in GetCellRang(sa_cell, rang)) {
						push(DATA_AOE[cell][area], [entity, coef]);
						DATA_AOE_SCORE[cell][area] += coef;
					} //cell
				} //rayon
			} //area_plus
		} //!== getleek
	} //entité
} //fct

function SetAoeLigne() {
	//DATA_AOE_LIGNE[cell][direction][rang] = score Aoe
	DATA_AOE_LIGNE_SCORE = getFilledArray(614, getFilledArray(4, getFilledArray(13, 0)));
	DATA_AOE_LIGNE = getFilledArray(614, getFilledArray(4, getFilledArray(13, [])));
	var alive = getAliveAllies();
	pushAll(alive, getAliveEnemies());
	for (var leek in alive) {
		if (leek !== getLeek()) {//MAJ :
			var coef = (isAlly(leek)) ? 1 : -1;
			var sa_cell = getCell(leek);
			var sa_cell_coos = [getCellX(sa_cell), getCellY(sa_cell)];
			for (var direction: var coos in LIGNE_DIRECTION) {
				for (var r = 0; r <= 12; r++) {	
					var cell = getCellFromXY(sa_cell_coos[0] + coos[0] * r, sa_cell_coos[1] + coos[1] * r);
					if (cell === null or isObstacle(cell)) {
						break;
					} //bloque la ligne de vue
					for (var r_max = r; r_max <= 12; r_max++) {

						//DATA_AOE_LIGNE_SCORE[cell][direction][r_max] += 100 * coef;
						DATA_AOE_LIGNE_SCORE[cell][DATA_DIRECTION_INVERSE[direction]][r_max] += 100 * coef;
						push(DATA_AOE_LIGNE[cell][DATA_DIRECTION_INVERSE[direction]][r_max], [leek, 100]);
						//push(DATA_AOE_LIGNE[cell][direction][r_max], [leek, 100]);
					}
				} //r
			} //direction
		} //!== getleek
	} //leek
} //fct

