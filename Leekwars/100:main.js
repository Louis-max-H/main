//////////////////////////////////////////////////////////////////
///////////////////////////3)main
//////////////////////////////////////////////////////////////////
include("015:debug");
stopProfiling(); //fin importation des fichiers

startProfiling("Chargement des data");
if (getTurn() === 1) { //ou 1 ? 
	setWeapon(getWeapons()[count(getWeapons())-1]);
	//les armes sont triées par ordre croissant de niveau, on prend le top level
	startProfiling("Initialisation premier tour");
	DATA_VOISIN_VIDE =  SetDataVoisin();
	DATA_VOISIN_OBSTACLE = SetDataVoisinObstacle();
	setDataMapScoreObstacle();
	stopProfiling();
}
startProfiling("Data voisin & AoE");
DATA_VOISIN = MajDataVoisin(DATA_VOISIN_OBSTACLE);
DATA_AOE = getFilledArray(614, getFilledArray(8, []));
DATA_AOE_SCORE = getFilledArray(614, getFilledArray(8, 0));
SetDataAOE();
SetAoeLigne();
stopProfiling();

startProfiling("Data LoS enemie & map score ");
DATA_LOS_ENEMIE = getFilledArray(614, 0);
DATA_MAP_SCORE = getFilledArray(614, 0);
DATA_MAP_SCORE_ANGLE = getFilledArray(614, 0);
SetDataScoreAngle();
SetDataLosEnemie();
DATA_DISTANCES = getTerrainDeplacement();
SetCellsScore();
if (getTurn() <= 8) {
	startProfiling("afficher map score");
	AfficherMapScore();
	stopProfiling();
}
stopProfiling();
stopProfiling(); //fin calculs des datas	

var svg_ma_cell = getCell();

startProfiling("main");
startProfiling("jouer");

//actions : [score, arme, cell_cible]
//scores replis : [score,cell_repplis]
var conteur_action = 0;
startProfiling("action " + conteur_action);
var pointeur = 0;
startProfiling("cells et LoS");
var mes_cells = GetCellAccesibles(getMP(), getCell(), DATA_VOISIN);
var cell_los = SetDataLos(mes_cells);
stopProfiling();
startProfiling("actions");
var actions = getActionsAvancees(mes_cells, cell_los);
AfficherActions(actions);
AfficherScoreActionArmes(actions);
stopProfiling();
stopProfiling();
while (pointeur < count(actions)) {
	var arme = actions[pointeur][ACTION_ARME];
	if (getTP() > getArmeCost(arme) or((getTP() == getArmeCost(arme)) and(IsChip(arme) or getWeapon() == arme))) {
		if (actions[pointeur][ACTION_SCORE_PLACEMENT] >= DATA_MAP_SCORE_REPPLIS_MOYENNE * COEF_MINIMUM_REPPLIS and actions[pointeur][ACTION_SCORE_TOTAL] >= COEF_MINIMUM_ACTION) {

			//Jouer
			startProfiling("jouer");
			var derniere_cell = getCell();
			var cell_cible = actions[pointeur][ACTION_CELL_CIBLE];
			var cell_attaquant = actions[pointeur][ACTION_CELL_PLACEMENT];
			debug("déplacement " + getCell() + " -> " + cell_attaquant + " pour attaquer la cell " + getCellContentString(cell_cible) + " avec l'arme " + getArmeName(arme));
			if (not isStackableArme(arme) and isLeek(cell_cible) and  isAlreadyEffected(getLeekOnCell(cell_cible),arme)) {
				continue;
			}
			moveTowardCell(cell_attaquant);
			jouerAction(arme, cell_cible);
			conteur_action += 1;
			stopProfiling();

			if (derniere_cell !== getCell() or getOperations()/OPERATIONS_LIMIT < 0.6) {
				startProfiling("action " + conteur_action);
				pointeur = 0;
				startProfiling("cells et LoS");
				mes_cells = GetCellAccesibles(getMP(), getCell(), DATA_VOISIN);
				cell_los = SetDataLos(mes_cells);
				stopProfiling();
				startProfiling("actions");
				actions = getActionsAvancees(mes_cells, cell_los);
				stopProfiling();
				stopProfiling();
			}

			if (getOperations() > OPERATIONS_LIMIT - 100000) {
				debugW("fin du tour par limite d'opération");
				pointeur = count(actions) + 1;
			}
		}
	} //bon score
	pointeur++;
} //while pointeur

//déplacement cell final
mes_cells = getCellAccesiblesFlatten(getMP(), getCell(), DATA_VOISIN);
var cell_max = null;
var score_max = -9999999;
for (var cell in mes_cells[0]) {
	if (DATA_MAP_SCORE[cell] > score_max) {
		score_max = DATA_MAP_SCORE[cell];
		cell_max = cell;
	}
}

debug("déplacement sur la cell final " + cell_max);
if (cell_max !== null) {
	moveTowardCell(cell_max);
}

DetailleScoreCells([svg_ma_cell, getCell()]);

debug(_DEBUG_OPTI);

FinishProfiling();