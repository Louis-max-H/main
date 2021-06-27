//////////////////////////////////////////////////////////////////
///////////////////////////2)Armes (scores)
//////////////////////////////////////////////////////////////////

include("011:arme_bases");
function GetCoefAggresivite(ideal) {
	return 1-(abs(ideal - COEF_AGRESSIVITE)**2);
}

function getLeekEffet(leek,effet_recherche){
	var valeur = 0;
	for (var effet in getEffects(leek)) {
		if (effet[0] == effet_recherche) {
			valeur += effet[1];
		}
	}
	return valeur;
}

function GetScore(effets, attaquant, cible, aoe, needDebug) {
	//renvoie le score d'un effet sur un poireau
	//[type, min, max, turns, targets, modifiers]
	var valeur = (effets[1]*2 + effets[2]) / 3;
	var effet = effets[0];
	var duree = effets[3] + 1;
	var modifier = effets[5];
	if (modifier & EFFECT_MODIFIER_ON_CASTER) {
		cible = getLeek();
		aoe = 1;
	}
	valeur *= abs(aoe);
	//debug("getscore : valeur : "+valeur+" effet "+effet +"duree "+duree);
	//exception

	var targets = effets[4];
	var type_cible = 0;
	if (isEnemy(cible)) {type_cible += EFFECT_TARGET_ENEMIES;}
	if (isAlly(cible)) {type_cible += EFFECT_TARGET_ALLIES;}
	if (cible === getLeek()) {type_cible += EFFECT_TARGET_CASTER;}
	if (isSummon(cible)) {type_cible += EFFECT_TARGET_SUMMONS;}
	if (isSummon(cible) === false) {type_cible += EFFECT_TARGET_NON_SUMMONS;}
	
	var exception = false;
	if (targets & type_cible === 0) {
		debug("(W): Impossible d'appliquer l'effet "+EFFECT_NAME(effet)+" sur la cible "+getName(cible));
		exception = true;
	}
	
	if (not isAlive(cible)) {exception = true;}
	
	if (exception) {
		if (needDebug) {
			return [0,0,0,0,0,0,0,0,0,0];
		}else{
			return 0;
		}
	}



	//coef en fontion de l'effet

	var coef = 1;
	var coef_agressivite;
	if (effet === EFFECT_HEAL) {
		valeur *= (1 + getWisdom(attaquant) / 100);
		if (getLife(cible) > getTotalLife(cible) - valeur or duree >= 3) {
			valeur = 0;
		} else {
			coef = 1+amplification((getLife(cible) / getTotalLife(cible)),0.2)*2;
		}
		coef_agressivite = GetCoefAggresivite(0.2);
	} else if (effet === EFFECT_DAMAGE) {
		valeur *= 1 + getStrength()/100;
		valeur = valeur * (1 - getRelativeShield(cible) / 100) - getAbsoluteShield(cible);
		if (valeur < 0){
			valeur = 0;
		}else{
			valeur +=  (getStrength()-STRENGTH_INIT)/3;
		}
		valeur += getLeekEffet(cible,EFFECT_ABSOLUTE_VULNERABILITY);
		
		if (valeur > getLife(cible)){valeur = 10000;}
		coef *= 1.3;
		coef_agressivite = GetCoefAggresivite(0.8);
	} else if (effet === EFFECT_ABSOLUTE_SHIELD) {
		valeur *= (1 + getResistance(attaquant) / 100);
		coef = 0.9 + count(getAliveEnemies()) / 4 +amplification((getLife(cible) / getTotalLife(cible)),0.2);
		coef /= 2;
		coef_agressivite = GetCoefAggresivite(0.4);
	} else if (effet === EFFECT_RELATIVE_SHIELD) {
		valeur *= (1 + getResistance(attaquant) / 100);
		coef = 1.6 * (count(getAliveEnemies()) / 3 + 1);
		coef_agressivite = GetCoefAggresivite(0.9);
	} else if (effet === EFFECT_BUFF_FORCE) {
		valeur *= (1 + getScience(attaquant) / 100);
		coef = 0.3;
		coef_agressivite = GetCoefAggresivite(0.4);
	} else if (effet === EFFECT_AFTEREFFECT) {
		valeur *= (1 + getScience(attaquant) / 100);
		if (getLife() < 200) {
			coef *= -1;
		} else {
			coef = -0.5;
		}
		coef_agressivite = GetCoefAggresivite(0.6);
	} else if (effet === EFFECT_POISON) {
		valeur *= (1 + getMagic(attaquant) / 100);
		coef = -1.2;
		coef_agressivite = GetCoefAggresivite(0.5);
	} else if (effet === EFFECT_SHACKLE_STRENGTH) {
		valeur *= (1 + getMagic(attaquant) / 100);
		coef = -1.5;
		coef_agressivite = GetCoefAggresivite(0.5);
	} else if (effet === EFFECT_SHACKLE_MP or effet == EFFECT_SHACKLE_TP) {
		valeur *= (1 + getMagic(attaquant) / 100);
		coef = 3;
		coef_agressivite = GetCoefAggresivite(0.5);
	} else if (effet === EFFECT_SHACKLE_MAGIC) {
		valeur *= (1 + getMagic(attaquant) / 100);
		coef = 1;
		coef_agressivite = GetCoefAggresivite(0.5);
	} else if (effet === EFFECT_BUFF_AGILITY) {
		valeur *= (1 + getScience(attaquant) / 100);
		coef = 1.5;
		coef_agressivite = GetCoefAggresivite(0.3);
	} else if (effet === EFFECT_BUFF_TP or effet == EFFECT_BUFF_MP or effet == EFFECT_BUFF_RESISTANCE) {
		valeur *= (1 + getScience(attaquant) / 100);
		coef = 10;
		coef_agressivite = GetCoefAggresivite(0.3);
	} else if (effet === EFFECT_ABSOLUTE_VULNERABILITY) {
		coef = 3;
		coef_agressivite = GetCoefAggresivite(0.8);
	} else {
		valeur = 0;
		coef = 0;
		coef_agressivite = 0 ;
		debugE("Effet " + effet + " ne possède pas de coefficient pour la fonction GetScore.");
	}
	
	if (inArray(EFFECT_OFFENSIVE, effet)) {
		valeur *= -1;
	}
	//coefficient en fonction de l'entité
	var coef_cible = getCoef(cible);

	var score = valeur * (coef+coef_agressivite) * coef_cible * (duree)**0.6;
	if (needDebug) {
		//["type effet","cell cible","aoe","valeur","coef","ceof cible","coef aggresivité","score","score reel"]
		var debug_data = [];
		push(debug_data, EFFECT_NAME[effet]);
		push(debug_data, getCellContentString(getCell(cible)));
		push(debug_data, abs(aoe));
		push(debug_data, valeur * duree**0.6);
		push(debug_data, coef);
		push(debug_data, coef_cible);
		push(debug_data, coef_agressivite);
		push(debug_data, score);
		push(debug_data, score / ARME_SCORE_MAX);
		return debug_data;
	}

	return score;
}

function GetScoreOnLeek(arme, attaquant, leek, aoe){
	var score = 0;
	for (var effet in getArmeEffects(arme)) {
		score += GetScore(effet,  attaquant,  leek,  aoe,  false);
	}
	return score;
	//surcharger getscore plutot que de créer une autre fonction ?
}

function GetScoreOnCell(arme, attaquant, cell, needDebug){
	var score = (needDebug) ? [] : 0;
	if (typeOf(cell) === TYPE_NUMBER) { //cell	
		var aoe = (isChip(arme)) ? getChipArea(arme) : getWeaponArea(arme);
		if (cell === -1) {
			cell = getCell();
		}

		if (cell === getCell()) {
			for (var effet in getArmeEffects(arme)) {
				if (needDebug) {
					push(score, [getArmeName(arme)] + GetScore(effet, attaquant, getLeek(), 1, true));
				} else {
					score += GetScore(effet, attaquant, getLeek(), 1, false);
				}
			}

		} else if (cell === 613) {
			for (var effet in getArmeEffects(arme)) {
				if (needDebug) {
					push(score, [getArmeName(arme)] + GetScore(effet, attaquant, getLeek(), 0, true));
				} else {
					score += GetScore(effet, attaquant, getLeek(), 0, false);
				}
			}
		} else {
			for (var cible in DATA_AOE[cell][aoe]) {
				for (var effet in getArmeEffects(arme)) {
					if (needDebug) {
						push(score, [getArmeName(arme)] + GetScore(effet, attaquant, cible[0], cible[1], true));
					} else {
						score += GetScore(effet, attaquant, cible[0], cible[1], false);
					}
				}
			}
		}
	} else if (typeOf(cell) === TYPE_ARRAY) {
		//DATA_AOE_LIGNE[cell][direction][rang] = [[leek,%], ...]
		var minn = (IsChip(arme)) ? getChipMinRange(arme) : getWeaponMinRange(arme);
		var maxx = (IsChip(arme)) ? getChipMaxRange(arme) : getWeaponMaxRange(arme);
		for (var cible_info in DATA_AOE_LIGNE[cell[0]][cell[1]][maxx]) {
			for (var effet in getArmeEffects(arme)) {
				if (needDebug) {
					push(score, [getArmeName(arme)] + GetScore(effet, attaquant, cible_info[0], cible_info[1], true));
				} else {
					score += GetScore(effet, attaquant, cible_info[0], cible_info[1], false);
				}
			}
		}
		if (needDebug === false) {
			for (var cible_info in DATA_AOE_LIGNE[cell[0]][cell[1]][minn]) {
				for (var effet in getArmeEffects(arme)) {
					score -= GetScore(effet, attaquant, cible_info[0], cible_info[1], debug);
				}
			}
		}
	}
	if (isWeapon(arme) and getWeapon() != arme) {
		if (needDebug) {
			score[8] *= MALUS_CHANGEMENT_ARME;
			score[8] /= getArmeCost(arme)**COEF_COST;
		}else{
			score *= MALUS_CHANGEMENT_ARME;
			//score /=  getArmeCost(arme);
		}
	}
	return score;
}

