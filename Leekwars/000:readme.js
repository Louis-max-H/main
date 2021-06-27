/*
Par : louis-max
Commencé le : 20 mai
Première version stable le 9 juin
Speudo code :
- On génére une map avec un score sur chaque cellules, en fonction de :
	- LoS enemie
	- Proximité obstacles
	- vie
	- distance du centre/enemie
	- Angle entre enemie et centre (bug ?)
- On génére les AoE pour chaque rayon d'explosion
- Pour chaque rayon de portée
	- Prendre le meilleur AoE pour l'attaque et la defense (allies)
- On génére un data repplis, ui contient le meilleurs score de la cell que l'on peut rejoindre en fonction de notre position
- Pour chaque arme
	- Prendre le meilleur AoE de sa portée
		- Attribuer un score de placement pour utiliser l'arme
- Prendre la meilleur solution



to-do :
- score cell placement, gérer les effets sur soi même
- canKillEnemie
- arme defensive sur alliés ?
- message tourelle
- pipotron

*/
