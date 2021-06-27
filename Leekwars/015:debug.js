///////////////////////////debug
//////////////////////////////////////////////////////////////////

include("014:jouer");

function AfficherActions(actions) {
	var array = [
		["arme", "cible", "attaquant", "score arme", "score placement", "total"]
	];
	for (var i in actions) {
		var ligne = [];
		push(ligne, getArmeName(i[ACTION_ARME]));
		push(ligne, getCellContentString(i[ACTION_CELL_CIBLE]));
		push(ligne, i[ACTION_CELL_PLACEMENT]);
		push(ligne, dot(i[ACTION_SCORE_ATTAQUE]));
		push(ligne, dot(i[ACTION_SCORE_PLACEMENT]));
		push(ligne, dot(i[ACTION_SCORE_TOTAL]));
		push(array, ligne);
	}
	debugArray(array);
}

function AfficherScoreActionArmes(actions){
	var score_action = [["arme","type effet","cell cible","aoe","valeur","coef","ceof cible","coef aggresivité","score","score réel"]];
	for (var action in actions) {
		var arme = action[ACTION_ARME];
		var cell_cible = action[ACTION_CELL_CIBLE];
		for (var key : var value in GetScoreOnCell(arme, getLeek(),cell_cible,true)) {
			if (typeOf(value) === TYPE_ARRAY) {
				push(score_action, value);
			}
		}
	}
	debugArray(score_action);
}

function DetailleScoreCells(cells){	
	var array = [["cell","centre","LoS","obs","angle","dist","total"]];
	for (var cell in cells) {
		var ligne = [];
		push(array,[getCellContentString(cell)]+getCellsScoreInformation(cell));
	}
	debugArray(array);
}

function AfficherMapScore() {
	var somme = 0;
	for (var i = 0; i < 613; i++) {
		mark(i, getColorGradient(DATA_MAP_SCORE[i] * 32));
		somme += DATA_MAP_SCORE[i];
	}
	var minn = arrayMin(DATA_MAP_SCORE);
	var maxx = arrayMax(DATA_MAP_SCORE);
	debug("Map score : (min/max/moyenne) : (" + dot(minn) + "/" + dot(maxx) + "/" + dot(somme / 614) + ")");
}
