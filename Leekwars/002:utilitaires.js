//////////////////////////////////////////////////////////////////
///////////////////////////2)Utilitaire
//////////////////////////////////////////////////////////////////

include("001:constantes");

function getCoef(leek) {
	var coef = (isSummon()) ? COEF_BULBE : COEF_LEEK;
	if (leek === getLeek()) {
		coef = COEF_GETLEEK;
	}

	coef *= (isEnemy(leek)) ? COEF_ENEMIE : COEF_ALLY;
	return coef;
}

function amplification(score,ideal){//score : [0;1]
	return (1 - abs(ideal - score))**2; 
}

function difference(nb1,nb2){
	return abs(nb2 - nb1);
}

function centerTextLeft(@text, @lg){
	if (typeOf(text) !== TYPE_STRING) {text = string(text);}
	if (length(text) <= lg) {
		var complement = lg - length(text);
		text = text + join(getFilledArray(complement, " "), "");
	}else{
		text = substring(text,0,lg);
	}
	return text;
}
function centerTextRight(@text, @lg){
	if (typeOf(text) !== TYPE_STRING) {text = string(text);}
	if (length(text) <= lg) {
		var complement = lg - length(text);
		text = join(getFilledArray(complement, " "), "") + text ;
	}else{
		text = substring(text,0,lg);
	}
	return text;
}

function centerTextMiddle(@text, @lg){
	if (typeOf(text) !== TYPE_STRING) {text = string(text);}
	if (length(text) <= lg) {
		var complement = (lg - length(text))/2;
		text = join(getFilledArray(round(complement), " "), "") + text +join(getFilledArray(floor(complement), " "), "");
	}else{
		text = substring(text,0,lg);
	}
	return text;
}

function _tris(@a,@b){//ordre décroissant
	if (a[0] > b[0]) {
		return -1;
	}else if (a[0]==b[0]) {
		return 0;
	}else{
		return 1;
	}
}
function dot(@number){
	return floor(number*100)/100;
}
function secondDegres(valeur,alpha,coef){
	return  ((valeur - alpha)*(coef))**2;
}

function getColorGradient(@d) { // d in [0, 32]
    var r = max(0,255-d*32) + min(255,max(0,d-24)*32), g = min(255, max(0,d-8)*32), b = max(0, 255-max(0,d-16)*32);
    return getColor(r,g,b);
}

function resetMark(){
	for (var i = 0; i < 613; i++) {
		mark(i, COLOR_BLANC);
	}
}

function debugArray(@array){
	//array : tableau en deux dimension
	var largeur = count(array[0]);
	var hauteur = count(array);
	
	var largeur_colonne = [];
	fill(largeur_colonne, 0, largeur);
	for (var ligne = 0; ligne < hauteur ; ligne++) {
		for (var colonne = 0; colonne < largeur ; colonne++) {
			array[ligne][colonne] = string(array[ligne][colonne]);
			if (length(array[ligne][colonne]) > largeur_colonne[colonne]) {
				largeur_colonne[colonne] = length(array[ligne][colonne]);
			}
		}
	}
	
	for (var ligne = 0; ligne < hauteur ; ligne++) {
		for (var colonne = 0; colonne < largeur ; colonne++) {
			array[ligne][colonne] = centerTextMiddle(array[ligne][colonne], largeur_colonne[colonne]+2);
		}//+2 pour éviter que le text soit collé
	}
	
	var ligne_haut = "╔";
	for (var colonne = 0; colonne < largeur; colonne++) {
		ligne_haut += join(getFilledArray(largeur_colonne[colonne]+2, "═"), "");
		if (colonne === largeur - 1) {
			ligne_haut += "╗\n";
		}else{
			ligne_haut += "╦";
		}
	}

	var ligne_bas = "╚";
	for (var colonne = 0; colonne < largeur; colonne++) {
		ligne_bas += join(getFilledArray(largeur_colonne[colonne]+2, "═"), "");
		if (colonne === largeur - 1) {
			ligne_bas += "╝\n";
		}else{
			ligne_bas += "╩";
		}
	}

	var ligne_millieux = "╠";
	for (var colonne = 0; colonne < largeur; colonne++) {
		ligne_millieux += join(getFilledArray(largeur_colonne[colonne]+2, "═"), "");
		if (colonne === largeur - 1) {
			ligne_millieux += "╣\n";
		}else{
			ligne_millieux += "╬";
		}
	}
	
	var text = "\n"+ligne_haut;
	for (var ligne = 0; ligne < hauteur ; ligne++) {
		text += "║";
		for (var colonne = 0; colonne < largeur; colonne++) {
			text += array[ligne][colonne];
			text += "║";
		}
		text += "\n";
		if (ligne === hauteur - 1) {
			text += ligne_bas;
		}else{
			text += ligne_millieux;
		}
	}
	
	debugOpti(text);
}

function getCellContentString(@cell){
	if (cell === -1 or cell === getCell()) {
		return string(cell) + " ("+string(getName())+")";
	}else if (cell === 613) {
		return "cell vide";
	}else if (typeOf(cell) === TYPE_ARRAY) {
		return string(cell[0]) + " ("+ LIGNE_DIRECTION_NOM[cell[1]]+")";

	}else if (isEmptyCell(cell)) {
		return string(cell);
	}else if (isObstacle(cell)) {
		return string(cell) + " (obstacle)";
	}else{
		return string(cell) + " ("+getName(getLeekOnCell(cell))+")";
	}
}


function getRealLife(leek,attaquant){
	return (getLife(leek)/(1 + getStrength(attaquant/100)));
}


/*
function getDifferenceLife(){
	//[0;1] : 0 = fuire : 1 = attaque
	var enemie = getNearestEnemy();
	var moi = getLeek();
	var ma_vie = getRealLife(moi,enemie);
	var sa_vie = getRealLife(enemie,moi);
	return (ma_vie/sa_vie)/(getTotalLife()/getTotalLife(enemie));
}

function getCoefHeal(){
	var dif = getDifferenceLife();
	if (getRealLife(getLeek(), getNearestEnemy()) < 100) {
		dif += 0;
	}else{
		dif += 0.5;//neutre
	}
	dif += (count(getAliveAllies())-count(getAliveEnemies()))/3;
	return dif;
}*/


