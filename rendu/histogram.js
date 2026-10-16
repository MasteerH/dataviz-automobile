const histoMarge = { haut: 20, droite: 70, bas: 65, gauche: 60 };
const histoHauteur = 320;
let histoLargeur = 600;
let histoDimension = null;
let histoColonnes = [];
let histoGroupe = null;
let histoEffacement = false;
const histoX = d3.scaleLinear();
const histoY = d3.scaleLinear();
const histoYDensite = d3.scaleLinear();
let histoPointsCourbe = [];
const histoLigne = d3.line()
  .x(function (p) { return histoX(p.x); })
  .y(function (p) { return histoYDensite(p.y); });
const histoBrush = d3.brushX();
let histoObservateur = null;
let histoFrame = null;

function histoAdapterLargeur() {
  const nouvelle = Math.max(80, document.getElementById("histo").clientWidth - histoMarge.gauche - histoMarge.droite);
  if (!histoGroupe || nouvelle === histoLargeur) return;
  const ancienneSelection = d3.brushSelection(histoGroupe.select(".histo-brush").node());
  const intervalle = ancienneSelection ? ancienneSelection.map(histoX.invert) : null;
  histoLargeur = nouvelle;
  d3.select("#histo svg").attr("width", histoLargeur + histoMarge.gauche + histoMarge.droite);
  histoRedessiner();
  if (intervalle) {
    histoEffacement = true;
    histoGroupe.select(".histo-brush").call(histoBrush.move, intervalle.map(histoX));
    histoEffacement = false;
  }
  cacherTooltip();
}

function histoSurvol(event) {
  if (event.buttons) { cacherTooltip(); return; }
  const [x, y] = d3.pointer(event, histoGroupe.node());
  if (x < 0 || x > histoLargeur || y < 0 || y > histoHauteur) { cacherTooltip(); return; }
  const indice = Math.min(histoColonnes.length - 1, Math.floor(x / histoLargeur * histoColonnes.length));
  const colonne = histoColonnes[indice];
  const choisi = colonne.voitures.filter(estSelectionnee).length;
  const borne = function (v) { return v.toLocaleString("fr-FR", { maximumFractionDigits: 6 }); };
  const texte = "Intervalle [" + borne(colonne.debut) + " ; " + borne(colonne.fin) + (indice === histoColonnes.length - 1 ? "]" : "[") +
    " · " + colonne.voitures.length + " voitures au total · " + choisi + (selection === null ? " affichées" : " sélectionnées");
  afficherTexteTooltip(event, texte);
}

function histoConfigurerLargeur() {
  const etendue = etendues[histoDimension][1] - etendues[histoDimension][0];
  const slider = document.getElementById("bandwidth-slider");
  slider.min = etendue * 0.01;
  slider.max = etendue * 0.25;
  slider.step = etendue * 0.001;
  slider.value = etendue * 0.05;
  slider.disabled = false;
}

function histoDessinerCourbe() {
  if (!histoGroupe) return;
  const largeur = Number(document.getElementById("bandwidth-slider").value);
  document.getElementById("bandwidth-value").value = largeur.toLocaleString("fr-FR", { maximumSignificantDigits: 4 });
  const points = [];
  for (let pixel = 0; pixel < histoLargeur; pixel += 3) points.push(histoX.invert(pixel));
  points.push(histoX.invert(histoLargeur));
  const groupe = filtreSelection ? data.filter(estSelectionnee) : data;
  const valeurs = groupe.map(function (d) { return d[histoDimension]; });
  const sommes = kde(valeurs, largeur, points);
  histoPointsCourbe = points.map(function (x, i) { return { x: x, y: sommes[i] }; });
  histoYDensite.domain([0, d3.max(sommes) || 1]).range([histoHauteur, 0]);
  histoGroupe.select(".histo-courbe").datum(histoPointsCourbe).attr("d", histoLigne);
  histoGroupe.select(".histo-axe-densite")
    .attr("transform", "translate(" + histoLargeur + ",0)")
    .call(d3.axisRight(histoYDensite).ticks(5).tickFormat(formatAxe));
  histoGroupe.select(".histo-axe-densite").selectAll("text").style("font-size", "12px");
  histoGroupe.select(".histo-vide").attr("x", histoLargeur / 2)
    .attr("display", groupe.length ? "none" : null);
}

function histoCalculerColonnes(nom, nombre) {
  const [minimum, maximum] = etendues[nom];
  const pas = (maximum - minimum) / nombre;
  const colonnes = Array.from({ length: nombre }, function (_, i) {
    return {
      debut: minimum + i * pas,
      fin: i === nombre - 1 ? maximum : minimum + (i + 1) * pas,
      voitures: []
    };
  });
  data.forEach(function (d) {
    let indice = pas === 0 ? 0 : Math.floor((d[nom] - minimum) / pas);
    indice = Math.max(0, Math.min(nombre - 1, indice));
    while (indice < nombre - 1 && d[nom] >= colonnes[indice].fin) indice++;
    while (indice > 0 && d[nom] < colonnes[indice].debut) indice--;
    colonnes[indice].voitures.push(d);
  });
  const total = colonnes.reduce(function (somme, colonne) {
    return somme + colonne.voitures.length;
  }, 0);
  if (total !== data.length) throw new Error("Effectif incohérent dans l’histogramme");
  return colonnes;
}

function histoEffacerBrush() {
  if (!histoGroupe) return;
  histoEffacement = true;
  histoGroupe.select(".histo-brush").call(histoBrush.move, null);
  histoEffacement = false;
}

function histoPendantBrush(event) {
  if (histoEffacement) return;
  if (event.selection === null) {
    setSelection(null, "histo");
    return;
  }
  const [minimum, maximum] = event.selection.map(histoX.invert);
  const tolerance = (etendues[histoDimension][1] - etendues[histoDimension][0]) * 1e-10;
  const ids = data.filter(function (d) {
    return d[histoDimension] >= minimum - tolerance && d[histoDimension] <= maximum + tolerance;
  }).map(function (d) { return d.id; });
  setSelection(ids, "histo");
}

function histoRedessiner() {
  if (!histoGroupe) return;
  const slider = document.getElementById("bin-slider");
  const nombre = Number(slider.value);
  document.getElementById("bin-value").value = nombre;
  histoColonnes = histoCalculerColonnes(histoDimension, nombre);
  histoX.domain(etendues[histoDimension]).range([0, histoLargeur]);
  histoY.domain([0, d3.max(histoColonnes, function (colonne) {
    return colonne.voitures.length;
  }) || 1]).nice().range([histoHauteur, 0]);

  histoGroupe.select(".histo-axe-x")
    .attr("transform", "translate(0," + histoHauteur + ")")
    .call(d3.axisBottom(histoX).ticks(Math.max(2, Math.floor(histoLargeur / 90))).tickFormat(formatAxe));
  histoGroupe.select(".histo-axe-y")
    .call(d3.axisLeft(histoY).ticks(6).tickFormat(function (v) {
      return Number.isInteger(v) ? v : "";
    }));
  histoGroupe.selectAll(".tick text").style("font-size", "12px");
  histoGroupe.select(".histo-titre-x")
    .attr("x", histoLargeur / 2).attr("y", histoHauteur + 48)
    .text(typeof libellesDimensions === "undefined" ? histoDimension : libellesDimensions[histoDimension].join(" "));
  histoGroupe.select(".histo-barres").selectAll("rect")
    .data(histoColonnes).join("rect")
    .attr("x", function (c) { return histoX(c.debut); })
    .attr("width", function (c) { return Math.max(0, histoX(c.fin) - histoX(c.debut) - 1); })
    .attr("y", function (c) { return histoY(c.voitures.length); })
    .attr("height", function (c) { return histoHauteur - histoY(c.voitures.length); })
    .attr("fill", couleurEfface);

  histoBrush.extent([[0, 0], [histoLargeur, histoHauteur]]);
  histoGroupe.select(".histo-brush").call(histoBrush);
  majHisto("histo");
}

function dessinerHisto() {
  const conteneur = document.getElementById("histo");
  d3.select(conteneur).selectAll(".placeholder").remove();
  histoLargeur = Math.max(80, conteneur.clientWidth - histoMarge.gauche - histoMarge.droite);
  histoDimension = dimensionCourante;
  histoConfigurerLargeur();
  histoGroupe = d3.select(conteneur).append("svg")
    .attr("width", histoLargeur + histoMarge.gauche + histoMarge.droite)
    .attr("height", histoHauteur + histoMarge.haut + histoMarge.bas)
    .attr("role", "img").attr("aria-label", "Histogramme interactif des voitures")
    .append("g").attr("transform", "translate(" + histoMarge.gauche + "," + histoMarge.haut + ")");
  histoGroupe.append("g").attr("class", "histo-barres");
  histoGroupe.append("g").attr("class", "histo-selection");
  histoGroupe.append("path").attr("class", "histo-courbe")
    .attr("fill", "none").attr("stroke", "#753c91").attr("stroke-width", 2.5)
    .attr("pointer-events", "none");
  histoGroupe.append("g").attr("class", "histo-axe-x");
  histoGroupe.append("g").attr("class", "histo-axe-y");
  histoGroupe.append("g").attr("class", "histo-axe-densite").attr("color", "#753c91");
  histoGroupe.append("text").attr("class", "histo-titre-x")
    .attr("text-anchor", "middle").style("font-size", "12px");
  histoGroupe.append("text").attr("transform", "rotate(-90)")
    .attr("x", -histoHauteur / 2).attr("y", -44)
    .attr("text-anchor", "middle").style("font-size", "12px").text("Nombre de voitures");
  histoGroupe.append("g").attr("class", "histo-brush");
  histoGroupe.append("text").attr("class", "histo-vide")
    .attr("y", histoHauteur / 2).attr("text-anchor", "middle")
    .attr("pointer-events", "none").style("font-size", "14px")
    .text("Aucune voiture dans cette sélection");
  histoGroupe.on("pointermove.tooltip", histoSurvol).on("pointerleave.tooltip", cacherTooltip);
  histoBrush.on("start", function () {
    if (typeof cacherTooltip === "function") cacherTooltip();
  }).on("brush end", histoPendantBrush);
  document.getElementById("bin-slider").addEventListener("input", histoRedessiner);
  document.getElementById("bandwidth-slider").addEventListener("input", histoDessinerCourbe);
  histoRedessiner();
  histoObservateur = new ResizeObserver(function () {
    cancelAnimationFrame(histoFrame);
    histoFrame = requestAnimationFrame(histoAdapterLargeur);
  });
  histoObservateur.observe(conteneur);
}

function majHisto(source) {
  if (!histoGroupe) return;
  if (source !== "histo") histoEffacerBrush();
  histoGroupe.select(".histo-barres").attr("display", filtreSelection ? "none" : null);
  const segments = [];
  histoColonnes.forEach(function (colonne) {
    let cumul = 0;
    ["gas", "diesel"].forEach(function (carburant) {
      const effectif = colonne.voitures.filter(function (d) {
        return estSelectionnee(d) && d["fuel-type"] === carburant;
      }).length;
      segments.push({ colonne: colonne, carburant: carburant, bas: cumul, haut: cumul + effectif });
      cumul += effectif;
    });
  });
  histoGroupe.select(".histo-selection").selectAll("rect")
    .data(segments).join("rect")
    .attr("x", function (s) { return histoX(s.colonne.debut); })
    .attr("width", function (s) { return Math.max(0, histoX(s.colonne.fin) - histoX(s.colonne.debut) - 1); })
    .attr("y", function (s) { return histoY(s.haut); })
    .attr("height", function (s) { return histoY(s.bas) - histoY(s.haut); })
    .attr("fill", function (s) { return couleur(s.carburant); });
  histoDessinerCourbe();
}

function dimensionHisto(nom) {
  if (nom === histoDimension) return;
  histoEffacerBrush();
  histoDimension = nom;
  histoConfigurerLargeur();
  histoRedessiner();
}

enregistrerVue({
  nom: "histo",
  dessiner: dessinerHisto,
  mettreAJour: majHisto,
  changerDimension: dimensionHisto
});
