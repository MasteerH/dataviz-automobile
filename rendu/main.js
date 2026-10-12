
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

// Libellés séparés des clés utilisées pour accéder aux données.
const libellesDimensions = {
 "symboling": ["Risque", "assurance"],
 "wheel-base": ["Empattement", "(pouces)"],
 "length": ["Longueur", "(pouces)"],
 "width": ["Largeur", "(pouces)"],
 "height": ["Hauteur", "(pouces)"],
 "curb-weight": ["Poids à vide", "(lb)"],
 "num-of-cylinders": ["Nombre de", "cylindres"],
 "engine-size": ["Cylindrée", "(pouces³)"],
 "compression-ratio": ["Taux de", "compression"],
 "city-mpg": ["Rendement ville", "(mpg)"],
 "highway-mpg": ["Rendement route", "(mpg)"],
 "price": ["Prix", "(USD)"]
};

function majCompteurSelection() {
 const compteur = document.getElementById("selection-count");
 compteur.textContent = selection === null
  ? "Aucune sélection active · " + data.length + " voitures affichées"
  : selection.size + " voiture" + (selection.size === 1 ? "" : "s") + " sélectionnée" + (selection.size === 1 ? "" : "s") + " sur " + data.length;
 document.getElementById("reset-selection").disabled = selection === null;
}

function cacherTooltip() {
 document.getElementById("tooltip").hidden = true;
}

function afficherTooltip(event, d) {
 const tip = document.getElementById("tooltip");
 tip.textContent = d.make + " · " + d.price.toLocaleString("fr-FR") + " USD · " + (d["fuel-type"] === "gas" ? "Essence" : "Diesel");
 tip.hidden = false;
 tip.style.left = Math.max(8, Math.min(event.clientX + 14, window.innerWidth - tip.offsetWidth - 8)) + "px";
 tip.style.top = Math.max(8, Math.min(event.clientY + 14, window.innerHeight - tip.offsetHeight - 8)) + "px";
}


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
 cacherTooltip();
 majCompteurSelection();
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
 document.querySelectorAll(".legend-swatch").forEach(function (pastille) {
  pastille.style.backgroundColor = couleur(pastille.dataset.fuel);
 });
 document.querySelectorAll("#dimension-select option").forEach(function (option) {
  option.textContent = libellesDimensions[option.value].join(" ");
 });
 document.getElementById("reset-selection").addEventListener("click", function () {
  setSelection(null, "reset");
 });
 window.addEventListener("scroll", cacherTooltip, true);
 majCompteurSelection();
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
