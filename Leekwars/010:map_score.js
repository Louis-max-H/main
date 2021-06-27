//////////////////////////////////////////////////////////////////
///////////////////////////4)map score
//////////////////////////////////////////////////////////////////

include("009:vecteurs");

function SetDataScoreAngle() {
	var nb_enemie = count(getAliveEnemies());
	for (var enemie in getAliveEnemies()) {
		var vecteurAB = VecteurCell(getCell(enemie), 306);
		var coef = getCoef(enemie);
		for (var cell = 0; cell < 613; cell++) {
			var vecteurAC = VecteurCell(getCell(enemie), cell);
			var angle = GetAngle(vecteurAB, vecteurAC);
			DATA_MAP_SCORE_ANGLE[cell] += (((angle - PI / 2) / PI * coef) / nb_enemie) * COEF_ANGLE;
		}
	}
}

function setDataMapScoreObstacle() {
	DATA_MAP_SCORE_OBSTACLE = getFilledArray(614, 0);

	for (var obs in getObstacles()) {
		for (var cell in GetCellRang(obs, 1)) {
			DATA_MAP_SCORE_OBSTACLE[cell] += COEF_OBSTACLE;
		}
		for (var cell in GetCellRang(obs, 2)) {
			DATA_MAP_SCORE_OBSTACLE[cell] += COEF_OBSTACLE / 2;
		}
		for (var cell in GetCellRang(obs, 3)) {
			DATA_MAP_SCORE_OBSTACLE[cell] += COEF_OBSTACLE / 4;
		}
	}
	for (var i = 0; i < 613; i++) {
		if (DATA_MAP_SCORE_OBSTACLE[i] > COEF_OBSTACLE_MAX) {
			DATA_MAP_SCORE_OBSTACLE[i] = COEF_OBSTACLE_MAX;
		}
	}
}

function SetCellsScore() {
	var resultat = [];
	var allies = getAliveAllies();
	var enemies = getAliveEnemies();
	var nb_allies = count(allies);
	var nb_enemies = count(enemies);
	var score;
	var coef = abs(COEF_DISTANCE);
	for (var cell = 0; cell < 613; cell++) {
		var sc_centre = COEF_CENTRE * getDistance(cell, 306);
		var sc_los = DATA_LOS_ENEMIE[cell] * COEF_LOS_GENERALE;
		var sc_obstacle;
		if (DATA_LOS_ENEMIE[cell] > 0) {
			sc_obstacle = DATA_MAP_SCORE_OBSTACLE[cell];
		} else { //on ne se rapproche pas des obstacle si pas los
			sc_obstacle = DATA_MAP_SCORE_OBSTACLE[cell] / 3;
		}
		var sc_angle = DATA_MAP_SCORE_ANGLE[cell];
		var ecart = difference(DATA_DISTANCES[cell], COEF_DISTANCE_MOYENNE);
		var sc_distance = (ecart >= 1.1) ? ecart * COEF_DISTANCE : COEF_DISTANCE;
		if (COEF_DISTANCE > 0 and DATA_DISTANCES[cell]< COEF_DISTANCE_MOYENNE) {
			sc_distance *= -1;
		}//positif donc on s'éloigne, mais on ne séloigne aps vers l'enemie ...


		DATA_MAP_SCORE[cell] = sc_centre + sc_los + sc_obstacle + sc_angle + sc_distance;
	}
	var maxx = arrayMax(DATA_MAP_SCORE);
	DATA_MAP_SCORE[18] = maxx;
	var minn = arrayMin(DATA_MAP_SCORE);
	DATA_MAP_SCORE[18] = minn; //c'est crade :-) 
	DATA_SCORE_MIN = minn;
	DATA_SCORE_MAX = maxx;
	var somme = maxx - minn;
	if (somme == 0) {
		somme = 1;
	}
	for (var cell = 0; cell < 613; cell++) {
		DATA_MAP_SCORE[cell] = ((DATA_MAP_SCORE[cell] - minn) / somme) ** 2;
	}
}

function GetCellScore(cells) {
	var resultat = [];
	for (var cell in cells) {
		push(resultat, DATA_MAP_SCORE[cell]);
	}
	return resultat;
}

function getCellsScoreInformation(cell) {
	var resultat = [];
	var allies = getAliveAllies();
	var enemies = getAliveEnemies();
	var nb_allies = count(allies);
	var nb_enemies = count(enemies);
	var score;
	var coef = abs(COEF_DISTANCE);
	var sc_centre = COEF_CENTRE * getDistance(cell, 306);
	var sc_los = DATA_LOS_ENEMIE[cell] * COEF_LOS_GENERALE;
	var sc_obstacle;
	if (DATA_LOS_ENEMIE[cell] > 0) {
		sc_obstacle = DATA_MAP_SCORE_OBSTACLE[cell];
	} else { //on ne se rapproche pas des obstacle si pas los
		sc_obstacle = DATA_MAP_SCORE_OBSTACLE[cell] / 3;
	}
	var sc_angle = DATA_MAP_SCORE_ANGLE[cell];
	var ecart = difference(DATA_DISTANCES[cell], COEF_DISTANCE_MOYENNE);
	var sc_distance = (ecart >= 1.1) ? ecart * COEF_DISTANCE : COEF_DISTANCE;

	return [sc_centre, sc_los, sc_obstacle, sc_angle, sc_distance, DATA_MAP_SCORE[cell]];
}

function setMapRepplis(cells, mp) {
	DATA_MAP_SCORE_REPPLIS = getFilledArray(614, [-1, null]);
	DATA_MAP_SCORE_REPPLIS_MOYENNE = 0;
	var max_score_cell_repplis = INT_MIN;
	//DATA_MAP_SCORE_REPPLIS[cell] = [score, cell repplis] 
	var scores = [];
	for (var c in cells[0]) {
		push(scores, [DATA_MAP_SCORE[c], c]);
		DATA_MAP_SCORE_REPPLIS_MOYENNE += DATA_MAP_SCORE[c];
	}
	DATA_MAP_SCORE_REPPLIS_MOYENNE = DATA_MAP_SCORE_REPPLIS_MOYENNE / (count(cells[0]) * 2 + 1);
	scores = arraySort(scores, _tris);
	for (var infos in scores) {
		var score = infos[0];
		var cell_origine = infos[1];
		var pile = [cell_origine];
		var tmp;
		for (var m = 0; m < mp; m++) {
			tmp = [];
			for (var cell in pile) {
				if (cells[1][cell] >= 0) {
					var mp_restant = mp - cells[1][cell] - m;
					if (mp_restant > 0 and DATA_MAP_SCORE_REPPLIS[cell][0] < score + mp_restant * COEF_MP_RESTANT) {
						DATA_MAP_SCORE_REPPLIS[cell] = [score + mp_restant * COEF_MP_RESTANT, cell_origine];
						max_score_cell_repplis = max(max_score_cell_repplis, DATA_MAP_SCORE_REPPLIS[cell][0]);

						for (var coos in [
								[0, 1],
								[0, -1],
								[1, 0],
								[-1, 1]
							]) {
							if (getCellFromXY(getCellX(cell) + coos[0], getCellY(cell) + coos[1]) !== null) {
								push(tmp, getCellFromXY(getCellX(cell) + coos[0], getCellY(cell) + coos[1]));
							} //existe
						} //voisin
					} //verif
				} //accessible
			} //pile
			pile = tmp;
		} //chaque mp
	} //chaque cell
	DATA_MAP_SCORE_REPPLIS_MAX = max_score_cell_repplis;
} // cfct