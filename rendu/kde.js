
function gaussienne(x, centre, largeur) {
	const ecart = (x - centre) / largeur;
	return Math.exp(-0.5 * ecart * ecart);
}


function kde(valeurs, largeur, points) {
	return points.map(function (x) {
		let somme = 0;
		valeurs.forEach(function (v) {
			somme += gaussienne(x, v, largeur);
		});
		return somme;
	});
}
