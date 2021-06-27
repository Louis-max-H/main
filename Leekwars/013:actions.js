//////////////////////////////////////////////////////////////////
///////////////////////////1)Anticiper
//////////////////////////////////////////////////////////////////

include("012:armes_scores");

function getDataRang(@portee){
	//création data range
	var max_scoop = GetMaxScoop(getLeek());
	var max_scoop_ligne = GetMaxScoopLine(getLeek());
	var ENEMIE = 0;
	var ALLY = 1;
	var CIRCLE = 0;
	var LIGNE = 1;
	var data_rang = getFilledArray(max(max_scoop, max_scoop_ligne) + 1, getFilledArray(8, [null, null]));

	//cercle (offensif)
	for (var rang = 0; rang <= max_scoop; rang++) {
		for (var type in [AREA_POINT, AREA_CIRCLE_1, AREA_CIRCLE_2, AREA_CIRCLE_3]){
			var maxx = 0;
			var minn = 0;
			var cell_max = null;
			var cell_min = null;
			for (var cell in portee[0][rang]) {
				if (DATA_AOE_SCORE[cell][type] > maxx) {
					maxx = DATA_AOE_SCORE[cell][type];
					cell_max = cell;
				}
				if (DATA_AOE_SCORE[cell][type] < minn) {
					minn = DATA_AOE_SCORE[cell][type];
					cell_min = cell;
				}
			} //cell
			data_rang[rang][type][ENEMIE] = cell_min;
			data_rang[rang][type][ALLY] = cell_max;
		} //type
	} //rang
	return data_rang;
}

function getActions(cells) {
	var cell_los = SetDataLos(cells);
	var max_scoop = GetMaxScoop(getLeek());
	var max_scoop_ligne = GetMaxScoopLine(getLeek());

	var resultat = [];
	var armes_a = getArmes(getLeek());
	var armes = SortArme(armes_a);

	//sur nous :
	for (var area in [AREA_CIRCLE_1, AREA_CIRCLE_2, AREA_CIRCLE_3, AREA_POINT]) {
		push(DATA_AOE[getCell()][area], [getLeek(), 1.2]);
		DATA_AOE_SCORE[getCell()][area] += 1.2;
	}
	for (var arme in armes[ARME_USAGE_DEFENSIVE]) {
		if (getCooldown(arme) == 0 and getChipMinRange(arme) == 0) {
			var score = GetScoreOnCell(arme, getLeek(), getCell(), false);
			if (score > 0) {
				push(resultat, [score, arme, -1]);
			}
		}
	}
	for (var area in [AREA_CIRCLE_1, AREA_CIRCLE_2, AREA_CIRCLE_3, AREA_POINT]) {
		pop(DATA_AOE[getCell()][area]);
		DATA_AOE_SCORE[getCell()][area] -= 1.2;
	}

	//sur une cell fictive (613)
	for (var arme in ARMES_ON_CASTER) {
		var score = GetScoreOnCell(arme, getLeek(), 613, false);
		if (score > 0) {
			push(resultat, [score, arme, 613]);
		}
	}

	//data rang
	var ENEMIE = 0;
	var ALLY = 1;
	var CIRCLE = 0;
	var LIGNE = 1;
	var portee = GetCellPropagation(max_scoop, cells,true);
	var portee_sans_los = GetCellPropagation(max_scoop,cells,false);
	var portee_ligne = GetCellPropagationLigne(max_scoop_ligne, cells);
	var data_rang_los = getDataRang(portee);
	var data_rang_sans_los = getDataRang(portee_sans_los);
	var data_rang = @data_rang_los;

	var armes_ligne = []; //[arme, min_scoop,max]
	//on sélection la meilleurs cible pour chacune des armes

	for (var arme in armes[ARME_USAGE_OFFENSIVE]) {
		data_rang = (armeNeedLoS(arme)) ? @data_rang_los : @data_rang_sans_los;
		var type = (isChip(arme)) ? getChipArea(arme) : getWeaponArea(arme);
		var maxx = (IsChip(arme)) ? getChipMaxRange(arme) : getWeaponMaxRange(arme);
		var minn = (IsChip(arme)) ? getChipMinRange(arme) : getWeaponMinRange(arme);
		if (getArmeArea(arme) != AREA_LASER_LINE) {
			var score_max = 0;
			var cell_score_max = null;
			for (var rang = minn; rang <= maxx; rang++) {
				if (data_rang[rang][type][ENEMIE] !== null) {
					var score = GetScoreOnCell(arme, getLeek(), data_rang[rang][type][ENEMIE], false);
					if (score > score_max) {
						score_max = score;
						cell_score_max = data_rang[rang][type][ENEMIE];
					} //max
				} //cell cible != -1
			} //rang
			if (score_max > 0 and cell_score_max !== null) {
				push(resultat, [score_max, arme, cell_score_max]);
			}
		} else {
			push(armes_ligne, [arme, minn, maxx]);
		} // !== area_line
	} //arme offensive

	//arme defensive
	for (var arme in armes[ARME_USAGE_DEFENSIVE]) {	
		data_rang = (armeNeedLoS(arme)) ? @data_rang_los : @data_rang_sans_los;
		var type = (isChip(arme)) ? getChipArea(arme) : getWeaponArea(arme);
		var maxx = (IsChip(arme)) ? getChipMaxRange(arme) : getWeaponMaxRange(arme);
		var minn = (IsChip(arme)) ? getChipMinRange(arme) : getWeaponMinRange(arme);
		if (type !== AREA_LASER_LINE) {
			var score_max = 0;
			var cell_score_max = null;
			for (var rang = minn; rang <= maxx; rang++) {
				if (data_rang[rang][type][ALLY] !== null) {
					var score = GetScoreOnCell(arme, getLeek(), data_rang[rang][type][ALLY], false);
					if (score > score_max) {
						score_max = score;
						cell_score_max = data_rang[rang][type][ALLY];
					} //max
				} //cell cible != -1
			} //rang
			if (score_max > 0 and cell_score_max !== null) {
				push(resultat, [score_max, arme, cell_score_max]);
			}
		} // !== area_line
	} //arme defensive
	
	

	//AREA_LINE
	//DATA_AOE_LIGNE[cell][direction][rang] = [[leek, coef] , ...]
	//DATA_AOE_LIGNE_SCORE[cell][direction][r_max] = Aoe
	for (var infos in armes_ligne) {
		var cell_min = null; //[cell_attaquant,direction]
		var minn = 0;
		for (var cell in cells) {
			for (var direction: var coos in LIGNE_DIRECTION) {
				var score = DATA_AOE_LIGNE_SCORE[cell][direction][infos[2]];
				score -= DATA_AOE_LIGNE_SCORE[cell][direction][infos[1]];
				if (score < minn) {
					minn = score;
					cell_min = [cell, direction];
				}
			} //chaque direction
		} //chaque cell
		if (cell_min !== null) { //on ajoute dans le data_action
			var score = GetScoreOnCell(infos[0], getLeek(), cell_min, false);
			if (score > 0) {
				push(resultat, [score, infos[0], cell_min]);
			}
		}
	} //chaque arme

	resultat = arraySort(resultat, _tris);
	ARME_SCORE_MAX = (resultat[0][0] === 0) ? 1 : resultat[0][0];
	debugOpti("arme score max : "+ARME_SCORE_MAX+" avec arme "+getArmeName(resultat[0][1]));
	for (var i = 0; i < count(resultat); i++) {
		if (resultat[i][0] > 1000) {
			resultat[i][0] = 1.1;
		}else{
			resultat[i][0] = (resultat[i][0] / ARME_SCORE_MAX);
			
		}
	}
	return resultat;
} //fct