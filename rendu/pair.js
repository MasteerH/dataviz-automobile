const pairMarge = { haut: 20, droite: 25, bas: 65, gauche: 70 };
const pairHauteur = 340;
const pairX = d3.scaleLinear();
const pairY = d3.scaleLinear();
const pairBrush = d3.brush();
let pairDimX = "curb-weight";
let pairDimY = "city-mpg";
let pairLargeur = 600;
let pairGroupe = null;
let pairEffacement = false;
let pairObservateur = null;
let pairDernierX = null;
let pairDernierY = null;

function pairEffacerBrush() {
  if (!pairGroupe) return;
  const noeud = pairGroupe.select(".pair-brush").node();
  if (!noeud || !noeud.__brush) return;
  pairEffacement = true;
  pairGroupe.select(".pair-brush").call(pairBrush.move, null);
  pairEffacement = false;
}

function pairPendantBrush(event) {
  if (pairEffacement) return;
  if (!event.selection) { setSelection(null, "pair"); return; }
  const [[x0, y0], [x1, y1]] = event.selection;
  setSelection(data.filter(function (d) {
    const x = pairX(d[pairDimX]), y = pairY(d[pairDimY]);
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
  }).map(function (d) { return d.id; }), "pair");
}

function pairMaj(source) {
  if (!pairGroupe) return;
  if (source !== "pair") pairEffacerBrush();
  const points = pairGroupe.selectAll(".pair-points circle")
    .attr("display", function (d) { return filtreSelection && !estSelectionnee(d) ? "none" : null; })
    .attr("fill", function (d) { return estSelectionnee(d) ? couleur(d["fuel-type"]) : couleurEfface; })
    .attr("opacity", function (d) { return estSelectionnee(d) ? 0.8 : 0.25; });
  points.filter(estSelectionnee).raise();
}

function pairRedessiner() {
  if (!pairGroupe) return;
  const boite = document.getElementById("pair-chart");
  if (!boite.clientWidth) return;
  const noeud = pairGroupe.select(".pair-brush").node();
  const ancien = noeud && noeud.__brush ? d3.brushSelection(noeud) : null;
  const intervalle = ancien && pairDernierX === pairDimX && pairDernierY === pairDimY
    ? ancien.map(function (point) { return [pairX.invert(point[0]), pairY.invert(point[1])]; }) : null;
  pairLargeur = Math.max(80, boite.clientWidth - pairMarge.gauche - pairMarge.droite);
  pairEffacerBrush();
  pairX.domain(etendues[pairDimX]).range([0, pairLargeur]);
  pairY.domain(etendues[pairDimY]).range([pairHauteur, 0]);
  d3.select("#pair-chart svg").attr("width", pairLargeur + pairMarge.gauche + pairMarge.droite);
  pairGroupe.select(".pair-axe-x").attr("transform", "translate(0," + pairHauteur + ")")
    .call(d3.axisBottom(pairX).ticks(Math.max(2, Math.floor(pairLargeur / 90))).tickFormat(formatAxe));
  pairGroupe.select(".pair-axe-y").call(d3.axisLeft(pairY).ticks(6).tickFormat(formatAxe));
  pairGroupe.selectAll(".tick text").style("font-size", "12px");
  pairGroupe.select(".pair-titre-x").attr("x", pairLargeur / 2).attr("y", pairHauteur + 48)
    .text(libellesDimensions[pairDimX].join(" "));
  pairGroupe.select(".pair-titre-y").text(libellesDimensions[pairDimY].join(" "));
  pairGroupe.select(".pair-points").selectAll("circle").data(voitures).join("circle")
    .attr("cx", function (d) { return pairX(d[pairDimX]); })
    .attr("cy", function (d) { return pairY(d[pairDimY]); }).attr("r", 4);
  pairBrush.extent([[0, 0], [pairLargeur, pairHauteur]]);
  pairGroupe.select(".pair-brush").call(pairBrush);
  if (intervalle) {
    pairEffacement = true;
    pairGroupe.select(".pair-brush").call(pairBrush.move, intervalle.map(function (point) { return [pairX(point[0]), pairY(point[1])]; }));
    pairEffacement = false;
  }
  pairDernierX = pairDimX;
  pairDernierY = pairDimY;
  pairMaj("pair");
}

function pairChoisir(x, y) {
  pairDimX = x;
  pairDimY = y;
  document.getElementById("pair-x").value = x;
  document.getElementById("pair-y").value = y;
  document.getElementById("pair-detail").open = true;
  pairRedessiner();
  document.getElementById("pair-detail").scrollIntoView({ block: "start" });
}

function pairDessiner() {
  ["pair-x", "pair-y"].forEach(function (id) {
    const menu = document.getElementById(id);
    dimensions.forEach(function (dim) {
      const option = document.createElement("option");
      option.value = dim;
      option.textContent = libellesDimensions[dim].join(" ");
      menu.appendChild(option);
    });
    menu.value = id === "pair-x" ? pairDimX : pairDimY;
    menu.addEventListener("change", function () {
      pairDimX = document.getElementById("pair-x").value;
      pairDimY = document.getElementById("pair-y").value;
      pairRedessiner();
    });
  });
  document.getElementById("pair-swap").addEventListener("click", function () { pairChoisir(pairDimY, pairDimX); });
  pairGroupe = d3.select("#pair-chart").append("svg")
    .attr("height", pairHauteur + pairMarge.haut + pairMarge.bas)
    .attr("role", "img").attr("aria-label", "Nuage de points agrandi pour deux dimensions")
    .append("g").attr("transform", "translate(" + pairMarge.gauche + "," + pairMarge.haut + ")");
  pairGroupe.append("g").attr("class", "pair-points");
  pairGroupe.append("g").attr("class", "pair-axe-x");
  pairGroupe.append("g").attr("class", "pair-axe-y");
  pairGroupe.append("text").attr("class", "pair-titre-x").attr("text-anchor", "middle").style("font-size", "12px");
  pairGroupe.append("text").attr("class", "pair-titre-y").attr("transform", "rotate(-90)")
    .attr("x", -pairHauteur / 2).attr("y", -52).attr("text-anchor", "middle").style("font-size", "12px");
  pairGroupe.append("g").attr("class", "pair-brush");
  pairBrush.on("start", cacherTooltip).on("brush end", pairPendantBrush);
  pairGroupe.on("pointermove.tooltip", function (event) {
    if (event.buttons) { cacherTooltip(); return; }
    const [x, y] = d3.pointer(event, this);
    let proche = null, distance = 100;
    voitures.forEach(function (d) {
      if (!estSelectionnee(d)) return;
      const carre = (pairX(d[pairDimX]) - x) ** 2 + (pairY(d[pairDimY]) - y) ** 2;
      if (carre <= distance) { distance = carre; proche = d; }
    });
    if (proche) afficherTooltip(event, proche); else cacherTooltip();
  }).on("pointerleave.tooltip", cacherTooltip);
  document.getElementById("pair-detail").addEventListener("toggle", pairRedessiner);
  pairObservateur = new ResizeObserver(pairRedessiner);
  pairObservateur.observe(document.getElementById("pair-chart"));
}

enregistrerVue({ nom: "pair", dessiner: pairDessiner, mettreAJour: pairMaj });
