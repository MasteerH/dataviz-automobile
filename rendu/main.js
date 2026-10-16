
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
 "city-mpg": ["Rendement", "ville (mpg)"],
 "highway-mpg": ["Rendement", "route (mpg)"],
 "price": ["Prix", "(USD)"]
};

function majCompteurSelection() {
 const compteur = document.getElementById("selection-count");
 compteur.textContent = selection === null
  ? "Aucune sélection active · " + data.length + " voitures affichées"
  : selection.size + " voiture" + (selection.size === 1 ? "" : "s") + " sélectionnée" + (selection.size === 1 ? "" : "s") + " sur " + data.length;
 document.getElementById("reset-selection").disabled = selection === null && !filtreSelection;
 const groupe = selection === null ? data : data.filter(estSelectionnee);
 const resume = document.getElementById("selection-summary");
 if (resume) {
  document.getElementById("summary-scope").textContent = selection === null ? "Résumé des 201 voitures" : "Résumé de la sélection";
  document.getElementById("summary-gas").textContent = groupe.filter(function (d) { return d["fuel-type"] === "gas"; }).length;
  document.getElementById("summary-diesel").textContent = groupe.filter(function (d) { return d["fuel-type"] === "diesel"; }).length;
  document.getElementById("summary-price").textContent = groupe.length ? d3.median(groupe, function (d) { return d.price; }).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " USD" : "—";
  document.getElementById("summary-mpg").textContent = groupe.length ? d3.median(groupe, function (d) { return d["city-mpg"]; }).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " mpg" : "—";
 }
}

function cacherTooltip() {
 document.getElementById("tooltip").hidden = true;
}

function afficherTooltip(event, d) {
 afficherTexteTooltip(event, d.make + " · " + d.price.toLocaleString("fr-FR") + " USD · " + (d["fuel-type"] === "gas" ? "Essence" : "Diesel"));
}

function afficherTexteTooltip(event, texte) {
 const tip = document.getElementById("tooltip");
 tip.textContent = texte;
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
let filtreSelection = false;
let sourceSelection = null;
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
 sourceSelection = source;
 if (source !== "criteria") {
  document.getElementById("criteria-form").reset();
  criteriaConfigurerDimension();
  document.getElementById("criteria-result").textContent = ids === null ? "Toutes les voitures sont affichées." : "Sélection effectuée dans un graphique. Le formulaire permet de choisir un nouveau groupe.";
 }
	if (ids === null) {
		selection = null;
	} else {
		selection = new Set(ids);
	}
 if (selection === null) filtreSelection = false;
	vues.forEach(function (vue) {
		vue.mettreAJour(source);
	});
 cacherTooltip();
 majCompteurSelection();
 majEtatFiltre();
}

function majEtatFiltre() {
 const caseFiltre = document.getElementById("filter-selection");
 caseFiltre.checked = filtreSelection;
 caseFiltre.disabled = false;
 let texte;
 if (filtreSelection && selection === null) {
  texte = "Filtrage activé : tracez un rectangle ou un intervalle dans un graphique pour garder uniquement les voitures choisies. En attendant, les 201 voitures restent visibles.";
 } else if (filtreSelection) {
  texte = "Filtre actif : " + selection.size + " voitures visibles sur " + data.length + ". La courbe porte sur ce groupe. Désactivez le filtre pour revoir les autres voitures.";
 } else if (selection !== null) {
  texte = selection.size + " voitures sélectionnées. Activez le filtre pour masquer les autres voitures.";
 } else {
  texte = "Tracez un rectangle ou un intervalle pour sélectionner des voitures. Activez le filtre pour afficher uniquement ce groupe.";
 }
 document.getElementById("filter-status").textContent = texte;
 document.querySelectorAll("[data-toggle-filter]").forEach(function (bouton) {
  bouton.setAttribute("aria-pressed", String(filtreSelection));
  bouton.textContent = filtreSelection ? "Désactiver le filtre" : "Afficher uniquement la sélection";
 });
 document.querySelectorAll(".filter-feedback").forEach(function (message) {
  message.textContent = texte;
 });
}

function setFiltreSelection(actif) {
 filtreSelection = actif;
 vues.forEach(function (vue) { vue.mettreAJour(sourceSelection); });
 majEtatFiltre();
 majCompteurSelection();
 cacherTooltip();
 if (sourceSelection === "criteria" && selection !== null) {
  document.getElementById("criteria-result").textContent = actif
   ? "Filtre appliqué : " + selection.size + " voitures affichées dans tous les graphiques."
   : "Filtre désactivé : les 201 voitures sont visibles ; le groupe choisi reste en couleur.";
 }
}

function criteriaConfigurerDimension() {
 const dim = document.getElementById("criteria-dimension").value;
 const minimum = document.getElementById("criteria-min");
 const maximum = document.getElementById("criteria-max");
 minimum.disabled = maximum.disabled = !dim;
 minimum.value = maximum.value = "";
 maximum.setCustomValidity("");
 if (dim) {
  minimum.placeholder = String(etendues[dim][0]);
  maximum.placeholder = String(etendues[dim][1]);
  document.getElementById("criteria-range").textContent = libellesDimensions[dim].join(" ") + " : valeurs observées de " + etendues[dim][0].toLocaleString("fr-FR") + " à " + etendues[dim][1].toLocaleString("fr-FR") + ". Laissez une borne vide pour ne pas la limiter.";
 } else {
  minimum.placeholder = maximum.placeholder = "";
  document.getElementById("criteria-range").textContent = "Les limites numériques sont facultatives.";
 }
 criteriaPrevisualiser();
}

function criteriaLire() {
 const carburant = document.getElementById("criteria-fuel").value;
 const dim = document.getElementById("criteria-dimension").value;
 const minInput = document.getElementById("criteria-min");
 const maxInput = document.getElementById("criteria-max");
 const minimum = dim && minInput.value !== "" ? minInput.valueAsNumber : -Infinity;
 const maximum = dim && maxInput.value !== "" ? maxInput.valueAsNumber : Infinity;
 maxInput.setCustomValidity(minimum > maximum ? "Le maximum doit être supérieur ou égal au minimum." : "");
 return { valide: minimum <= maximum && !minInput.validity.badInput && !maxInput.validity.badInput,
  actif: Boolean(carburant || (dim && (minInput.value !== "" || maxInput.value !== ""))),
  voitures: data.filter(function (d) { return (!carburant || d["fuel-type"] === carburant) && (!dim || (d[dim] >= minimum && d[dim] <= maximum)); }) };
}

function criteriaPrevisualiser() {
 const criteres = criteriaLire();
 document.getElementById("criteria-preview").textContent = criteres.valide
  ? criteres.voitures.length + " voitures correspondent à ces critères."
  : "Vérifiez vos limites : le minimum doit être inférieur ou égal au maximum.";
}

function criteriaInitialiser() {
 const menu = document.getElementById("criteria-dimension");
 dimensions.forEach(function (dim) {
  const option = document.createElement("option");
  option.value = dim;
  option.textContent = libellesDimensions[dim].join(" ");
  menu.appendChild(option);
 });
 menu.addEventListener("change", criteriaConfigurerDimension);
 document.getElementById("criteria-form").addEventListener("input", criteriaPrevisualiser);
 document.getElementById("criteria-fuel").addEventListener("change", criteriaPrevisualiser);
 document.getElementById("criteria-reset").addEventListener("click", function () { setSelection(null, "reset"); });
 document.getElementById("criteria-form").addEventListener("submit", function (event) {
  event.preventDefault();
  const criteres = criteriaLire();
  if (!criteres.valide || !event.target.reportValidity()) return;
  if (!criteres.actif) { setSelection(null, "reset"); return; }
  setSelection(criteres.voitures.map(function (d) { return d.id; }), "criteria");
  setFiltreSelection(true);
  document.getElementById("criteria-result").textContent = criteres.voitures.length
   ? "Filtre appliqué : " + criteres.voitures.length + " voitures affichées dans tous les graphiques."
   : "Aucune voiture ne correspond. Élargissez les limites ou cliquez sur Tout afficher.";
 });
 criteriaConfigurerDimension();
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
 criteriaInitialiser();
 document.getElementById("filter-selection").addEventListener("change", function (event) {
  setFiltreSelection(event.target.checked);
 });
 document.querySelectorAll("[data-toggle-filter]").forEach(function (bouton) {
  bouton.addEventListener("click", function () { setFiltreSelection(!filtreSelection); });
 });
 majEtatFiltre();
 document.querySelectorAll("[data-explore]").forEach(function (bouton) {
  bouton.addEventListener("click", function () {
   setDimension(bouton.dataset.explore);
   document.getElementById("histo-title").scrollIntoView({ block: "start" });
  });
 });
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
 document.querySelectorAll('a[href^="#"]').forEach(function (lien) {
  lien.addEventListener("click", function (event) {
   const cible = document.getElementById(lien.getAttribute("href").slice(1));
   if (cible !== null) {
    event.preventDefault();
    cible.scrollIntoView({ behavior: "smooth" });
   }
  });
 });
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
