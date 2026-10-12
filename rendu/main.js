
const dimensions = [
	"symboling",
	"wheel-base",
	"length",
	"width",
	"height",
	"curb-weight",
	"num-of-cylinders",
	"engine-size",
	"compression-ratio",
	"city-mpg",
	"highway-mpg",
	"price"
];


data.forEach(function (d, i) {
	d.id = i;
});


const voitures = data.slice().sort(function (a, b) {
	return d3.descending(a["fuel-type"], b["fuel-type"]);
});


const etendues = {};
dimensions.forEach(function (dim) {
	etendues[dim] = d3.extent(data, function (d) {
		return d[dim];
	});
});


const couleur = d3.scaleOrdinal()
	.domain(["gas", "diesel"])
	.range(["#1f77b4", "#ff7f0e"]);

const couleurEfface = "#cccccc";
const couleurDimension = "#16789b";


const formatNombre = d3.format("~s");

function formatAxe(valeur) {
	if (valeur < 0) {
		return "-" + formatNombre(-valeur);
	}
	return formatNombre(valeur);
}


function couperNom(nom) {
	const i = nom.lastIndexOf("-");
	if (i === -1) {
		return [nom];
	}
	return [nom.slice(0, i), nom.slice(i + 1)];
}


let selection = null;
let dimensionCourante = "price";


const vues = [];

function enregistrerVue(vue) {
	vues.push(vue);
}


function estSelectionnee(d) {
	if (selection === null) {
		return true;
	}
	return selection.has(d.id);
}


function setSelection(ids, source) {
	if (ids === null) {
		selection = null;
	} else {
		selection = new Set(ids);
	}
	vues.forEach(function (vue) {
		vue.mettreAJour(source);
	});
}


function setDimension(nom) {
	dimensionCourante = nom;
	const menu = document.getElementById("dimension-select");
	if (menu !== null) {
		menu.value = nom;
	}
	vues.forEach(function (vue) {
		if (vue.changerDimension) {
			vue.changerDimension(nom);
		}
	});
}


window.addEventListener("load", function () {
	vues.forEach(function (vue) {
		vue.dessiner();
	});
	const menu = document.getElementById("dimension-select");
	if (menu !== null) {
		menu.addEventListener("change", function () {
			setDimension(menu.value);
		});
	}

	setDimension(dimensionCourante);
});
