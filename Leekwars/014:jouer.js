//////////////////////////////////////////////////////////////////
///////////////////////////2)Jouer
//////////////////////////////////////////////////////////////////

include("013:actions");

function jouerAction(arme, cell_cible) {

	if (cell_cible === 613) {
		var cell = GetCellAdjacentLibre(getCell());
		if (isEmpty(cell)) {
			debugW("Aucune cell libre à cotés de la cell " + getCell());
		} else {
			cell_cible = cell[0];
		}

	}
	if (cell_cible === 613) {
		debugW("jouer arme sur cell 613 impossible");
		return;
	}

	if (cell_cible === -1) {
		cell_cible = getCell();
	}

	if (typeOf(cell_cible) === TYPE_ARRAY) {
		var minn = (IsChip(arme)) ? getChipMinRange(arme) : getWeaponMinRange(arme);
		var x = getCellX(cell_cible[0]);
		var y = getCellY(cell_cible[0]);
		x += LIGNE_DIRECTION[cell_cible[1]][0] * minn;
		y += LIGNE_DIRECTION[cell_cible[1]][1] * minn;
		cell_cible = getCellFromXY(x, y);
	}

	if (isWeapon(arme) and getWeapon() !== arme) {
		setWeapon(arme);
	}
	var resultat;
	do {
		resultat = (IsChip(arme)) ? useChipOnCell(arme, cell_cible) : useWeaponOnCell(cell_cible);
		var name = (IsChip(arme)) ? getChipName(arme) : getWeaponName(arme);
		debug("utilisation de l'arme " + name + " sur la cell " + cell_cible + " (" + DATA_USE_NAME[resultat] + ")");
	} while (resultat > 0 and(isWeapon(arme) or getArmeEffects(arme)[5] & EFFECT_MODIFIER_STACKABLE));

}

function GetCellAttaquant(arme, cell_cible) {
	//renvoie les cellules depuis lesquelles, on peut tirer sur la cell_cible avec l'arme arme

	if (typeOf(cell_cible) === TYPE_ARRAY) { //laser
		return cell_cible;
	}

	var rang_min = (IsChip(arme)) ? getChipMinRange(arme) : getWeaponMinRange(arme);
	var rang_max = (IsChip(arme)) ? getChipMaxRange(arme) : getWeaponMaxRange(arme);
	var resultat = getFilledArray(rang_max,[]);
	var onLine, needLos;
	if (IsChip(arme)) {
		onLine = isInlineChip(arme);
		needLos = chipNeedLos(arme);
	} else {
		onLine = isInlineWeapon(arme);
		needLos = weaponNeedLos(arme);
	}
	//debug("rang min/max : " + rang_min+"/"+rang_max);
	if (needLos) {
		//LoS
		if (onLine) { //ligne
			for (var rang = rang_min; rang <= rang_max; rang++) {
				//debug("ajout pour le rang "+rang);
				resultat[rang]=GetLosRangeLigne(cell_cible, rang);
			}
		} else { //cercle
			for (var rang = rang_min; rang <= rang_max; rang++) {
				resultat[rang]=GetLoSRange(cell_cible, rang);
			}
		}

	} else {
		//pas de LoS
		for (var rang = rang_min; rang <= rang_max; rang++) {
			resultat[rang]=GetCellRang(cell_cible, rang);
		}
	}
	//debug("cell attaquant pour l'arme " + getArmeName(arme));
	//debug("resultat : " + resultat);
	return resultat; 
}

function GetCellJouerArme(arme, cell_cible) {
	var PT = getTP();
	if (getArmeCost(arme) > PT or(getArmeCost(arme) == PT and arme !== getWeapon())) {
		return "pas assez PT";
	} //pt
	if (isChip(arme) and getCooldown(arme) > 0) {
		return "cooldown > 0";
	}

	if (cell_cible === -1 or cell_cible === 613) { //sur nous même
		return [DATA_MAP_SCORE_REPPLIS_MAX, getCell()];
	} else if (typeOf(cell_cible) == TYPE_ARRAY) {
		return [DATA_MAP_SCORE_REPPLIS[cell_cible[0]][0], cell_cible[0]];
	} else {
		var max_score = 0;
		var max_cell = -1;
		var cell_attaquant = GetCellAttaquant(arme, cell_cible);
		var portee_max = count(cell_attaquant);
		var area_taille = 1;
		var area = (isChip(arme)) ? getChipArea(arme) : getWeaponArea(arme);
		if (inArray(AREA_SIZE, area)) {
			area_taille = AREA_SIZE[area];
		}
		
		for (var rang = 0; rang < portee_max ; rang++) {
			var ajout = 0;
			if (rang <= area_taille) {
				ajout = GetScoreOnLeek(arme,getLeek(),getLeek(),1 - 0.2*rang);
			}
		
			for (var cell in cell_attaquant[rang]) {
				var score = DATA_MAP_SCORE_REPPLIS[cell][0] + (ajout / ARME_SCORE_MAX)*COEF_AUTO_AFFECT;
				if (score > max_score) {
					max_score = score;
					max_cell = cell;
				}
			}
		} //cell attaque
		return [max_score, max_cell];
	} //cercle ou ligne
} //fct


function getActionsAvancees(mes_cells, cell_los) {
	startProfiling("génération actions");
	var actions_attaque = getActions(arrayFlatten(mes_cells[0]));
	setMapRepplis([arrayFlatten(mes_cells[0]), mes_cells[1]], getMP());
	//pause();
	for (var i = 0; i < 613; i++) {
		if (DATA_MAP_SCORE_REPPLIS[i] !== [-1, null]) {
			mark(i, getColorGradient(DATA_MAP_SCORE_REPPLIS[i][0] * 32));
		}
	}
	stopProfiling();

	startProfiling("actions");
	var actions = [];
	var nb_actions = count(actions_attaque);
	//debug("action avancée : actions : "+actions_attaque);
	for (var i = 0; i < nb_actions; i++) {
		var score_attaque = actions_attaque[i][0];
		var arme = actions_attaque[i][1];
		var cell_cible = actions_attaque[i][2];
		if (score_attaque > 0) {
			var infos_replit = GetCellJouerArme(arme, cell_cible);
			var score_repplis = infos_replit[0];
			if (score_attaque > 1 ) {score_repplis += 0.3;}
			var cell_repplis = infos_replit[1];
			var score_total = score_attaque * (1 - COEF_PLACEMENT) + (score_repplis * COEF_PLACEMENT);

			var action = getFilledArray(6, 0);
			action[ACTION_ARME] = arme;
			action[ACTION_CELL_CIBLE] = cell_cible;
			action[ACTION_SCORE_ATTAQUE] = score_attaque;
			action[ACTION_SCORE_PLACEMENT] = score_repplis;
			action[ACTION_SCORE_TOTAL] = score_total;
			action[ACTION_CELL_PLACEMENT] = cell_repplis;
			if (action[ACTION_CELL_PLACEMENT] !== -1 and action[ACTION_CELL_PLACEMENT] !== null) {
				push(actions, action);
			} //on peut bien l'attaquer'
		} //score > 0
	}
	actions = arraySort(actions, _tris);
	stopProfiling();
	return actions;
}