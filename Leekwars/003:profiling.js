//////////////////////////////////////////////////////////////////
///////////////////////////3)profiling
//////////////////////////////////////////////////////////////////

include("002:utilitaires");


function startProfiling(text) {
    var profile = [TEXTT : text, OPERATIONS : getOperations(), CHILD_TEXT : ""];
    push(_savedProfiles, profile);
}

function stopProfiling() {
	var width = 60;
	var tabulation = "   ";
	
	//on stop le dernier profil activé
	var profile = pop(_savedProfiles);
	var totalOps = getOperations() - profile[OPERATIONS];
	//on génére le text
	var textt = join(getFilledArray(count(_savedProfiles), tabulation), "");//alinéa
	textt += centerTextLeft(profile[TEXTT]+" : "+centerTextRight(floor((totalOps/200000)), 2) +"%", width - length(tabulation)*count(_savedProfiles));
	textt += ' : ' + centerTextRight(string(totalOps),8) + ' opérations ('+floor((totalOps/2000))/100+"%)";
	textt += profile[CHILD_TEXT];
	
	//Si toute la pile est finit, on peut afficher
	if (count(_savedProfiles) === 0) {
		debugOpti("\n"+textt);
	}else{//sinon, on l'ajoute au dernier profile
		_savedProfiles[count(_savedProfiles)-1][CHILD_TEXT] += "\n" + textt;
	}
}
function FinishProfiling(){
	var nb = count(_savedProfiles);
	for (var i = 0; i < nb; i++) {
		stopProfiling();
	}
}

startProfiling("total :");
startProfiling("chargement des fonciton");