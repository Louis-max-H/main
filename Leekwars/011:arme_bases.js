//////////////////////////////////////////////////////////////////
///////////////////////////1)armes (base)
//////////////////////////////////////////////////////////////////

include("010:map_score");

function getArmes(leek){
	var armes = getWeapons(leek);
	pushAll(armes, getChips(leek));
	return armes;
}

function getArmeName(arme){
	return (IsChip(arme)) ? getChipName(arme) : getWeaponName(arme);
}

function getArmeEffects(arme) {
	return DATA_ARME[arme][ARME_EFFECTS];
}

function isOffensive(arme) {
	return DATA_ARME[arme][ARME_TYPE] == ARME_USAGE_OFFENSIVE;
}

function isDefensive(arme) {
	return DATA_ARME[arme][ARME_TYPE] == ARME_USAGE_OFFENSIVE;
}

function IsChip(arme){
	return DATA_ARME[arme][ARME_TYPE] == ARME_TYPE_CHIP;
}

function isAlreadyEffected(leek,arme){//opti : geteffects coute 115 ops Oo
	for (var effet in getEffects(leek)) {
		if (effet[5] == arme) {
			return true;
		}
	}
	return false;
}


function armeNeedLoS(arme){return (IsChip(arme)) ? chipNeedLos(arme) : weaponNeedLos(arme);}

function getArmeCost(arme){return (IsChip(arme)) ? getChipCost(arme) : getWeaponCost(arme);}

function SortArme(armes) {
	var resultat = [
		[],
		[],
		[]
	];
	for (var arme in armes) {
		push(resultat[DATA_ARME[arme][ARME_USAGE]], arme);
	}
	return resultat;
}

function GetArmesType(leek, type) {
	var resultat = [];
	for (var arme in getWeapons(leek)) {
		if (DATA_ARME[arme][ARME_TYPE] == type) {
			push(resultat, arme);
		}
	}
	for (var arme in getChips(leek)) {
		if (DATA_ARME[arme][ARME_TYPE] == type and getCooldown(arme, leek) == 0) {
			push(resultat, arme);
		}
	}
	return resultat;
}

function isStackableArme(arme){
	for (var effet in getArmeEffects(arme)) {
		if (effet[5] & EFFECT_MODIFIER_STACKABLE) {
			return true;
		}
	}
	return false;	
}

function GetMaxScoop(leek){
	var maxi = 0;
	for (var arme in getWeapons(leek)) {
		if (getWeaponArea(arme) !== AREA_LASER_LINE) {
			maxi = max(getWeaponMaxRange(arme), maxi);
		}
	}
	for (var arme in getChips(leek)) {
		if ((isOffensive(arme) or isDefensive(arme)) and getChipArea(arme) !== AREA_LASER_LINE) {
			maxi = max(getChipMaxRange(arme), maxi);	
		}
	}
	return maxi;
}

function GetMaxScoopLine(leek){
	var maxi = 0;
	for (var arme in getWeapons(leek)) {
		if (getWeaponArea(arme) === AREA_LASER_LINE) {
			maxi = max(getWeaponMaxRange(arme), maxi);
		}
	}
	for (var arme in getChips(leek)) {
		if ((isOffensive(arme) or isDefensive(arme)) and getChipArea(arme) === AREA_LASER_LINE) {
			maxi = max(getChipMaxRange(arme), maxi);	
		}
	}
	return maxi;
}

if (getTurn() === 1) {
	for (var arme in getArmes(getLeek())) {
		var on_me = false;
		for (var effet in getArmeEffects(arme)) {
			if (effet[5] & EFFECT_MODIFIER_ON_CASTER) {
				on_me = true;
				break;
			}
		}
		if (on_me) {
			push(ARMES_ON_CASTER, arme);
		}
	}
}
function getArmeArea(arme){
	if (isWeapon(arme)){
		return getWeaponArea(arme);
	}else {
		return getChipArea(arme);
	}
}


















