//////////////////////////////////////////////////////////////////
///////////////////////////3)vecteurs
//////////////////////////////////////////////////////////////////

include("008:AoE");

function GetVecteur(ax,ay,bx,by){
	return [bx-ax,by-ay];
}

function VecteurCell(cell1,cell2){
	return GetVecteur(getCellX(cell1), getCellY(cell1), getCellX(cell2), getCellY(cell2));
}

function Norme(vecteur){
	return sqrt(vecteur[0]**2 + vecteur[1]**2);
}

function ProduitScalaire(vec1,vec2){
	return vec1[0]*vec2[0]+vec1[1]*vec2[1];
}

function GetAngle(vecteur1,vecteur2){
	//vAB et vAC calcule angle BAC
	var denominateur = Norme(vecteur1)*Norme(vecteur2);
	if (denominateur === 0) {return 0;}
	return acos(ProduitScalaire(vecteur1,vecteur2)/denominateur);
}