
const paraMarge = { haut: 60, droite: 65, bas: 25, gauche: 65 };
const paraLargeurMin = 1430;
const paraHauteur = 360;
const paraDemiBrush = 10;

const paraX = d3.scalePoint()
	.domain(dimensions);

const paraY = {};

dimensions.forEach(function (dim) {
	paraY[dim] = d3.scaleLinear()
		.domain(etendues[dim])
		.range([paraHauteur, 0]);
});

const paraLigne = d3.line();

const paraBrush = d3.brushY()
	.extent([[-paraDemiBrush, 0], [paraDemiBrush, paraHauteur]]);

const paraFiltres = new Map();
let paraEffacement = false;


function paraChemin(d) {
	return paraLigne(dimensions.map(function (dim) {
		return [paraX(dim), paraY[dim](d[dim])];
	}));
}


function paraAppliquerFiltres() {
	if (paraFiltres.size === 0) {
		setSelection(null, "parallel");
		return;
	}

	const ids = data.filter(function (d) {
		let garde = true;
		paraFiltres.forEach(function (bornes, dim) {
			if (d[dim] < bornes[0] || d[dim] > bornes[1]) {
				garde = false;
			}
		});
		return garde;
	}).map(function (d) {
		return d.id;
	});

	setSelection(ids, "parallel");
}


function paraPendantBrush(event, dim) {
	if (paraEffacement) {
		return;
	}
	if (event.selection === null) {
		paraFiltres.delete(dim);
	} else {
		const haut = paraY[dim].invert(event.selection[0]);
		const bas = paraY[dim].invert(event.selection[1]);
		paraFiltres.set(dim, [bas, haut]);
	}
	paraAppliquerFiltres();
}


function paraEffacerBrush() {
	if (paraFiltres.size === 0) {
		return;
	}
	paraEffacement = true;
	d3.select("#parallel").selectAll(".para-brush").call(paraBrush.move, null);
	paraEffacement = false;
	paraFiltres.clear();
}


function dessinerParallel() {
	const conteneur = document.getElementById("parallel");
	const paraLargeur = Math.max(paraLargeurMin, conteneur.clientWidth - paraMarge.gauche - paraMarge.droite - 24);

	paraX.range([0, paraLargeur]);

	const svg = d3.select("#parallel")
		.append("svg")
		.attr("width", paraLargeur + paraMarge.gauche + paraMarge.droite)
		.attr("height", paraHauteur + paraMarge.haut + paraMarge.bas)
		.style("user-select", "none")
		.append("g")
		.attr("transform", "translate(" + paraMarge.gauche + "," + paraMarge.haut + ")");

	svg.append("g")
		.attr("class", "para-lignes")
		.selectAll("path")
		.data(voitures)
		.enter()
		.append("path")
		.attr("d", paraChemin)
		.attr("fill", "none")
		.attr("stroke-width", 1);

	const axes = svg.selectAll(".para-axe")
		.data(dimensions)
		.enter()
		.append("g")
		.attr("class", "para-axe")
		.attr("transform", function (dim) {
			return "translate(" + paraX(dim) + ",0)";
		});

	axes.each(function (dim) {
		d3.select(this).call(d3.axisLeft(paraY[dim]).ticks(5).tickFormat(formatAxe));
	});

	axes.selectAll(".tick text")
		.style("font-size", "12px")
		.style("paint-order", "stroke")
		.style("stroke", "white")
		.style("stroke-width", "3px");

	axes.append("text")
		.attr("class", "para-nom")
		.attr("text-anchor", "middle")
		.attr("fill", "black")
		.style("font-size", "12px")
		.style("font-weight", "bold")
		.style("cursor", "pointer")
		.on("click", function (event, dim) {
			setDimension(dim);
		})
		.each(function (dim) {
			const morceaux = libellesDimensions[dim];
			d3.select(this).selectAll("tspan")
				.data(morceaux)
				.enter()
				.append("tspan")
				.attr("x", 0)
				.attr("y", function (m, i) {
					return -12 - (morceaux.length - 1 - i) * 15;
				})
				.text(function (m) {
					return m;
				});
		});

	paraBrush
  .on("start.tooltip", cacherTooltip)
		.on("brush", paraPendantBrush)
		.on("end", paraPendantBrush);

	axes.append("g")
		.attr("class", "para-brush")
		.call(paraBrush);

 // Chercher la ligne la plus proche, même lorsque le pointeur est sur un brush.
 svg.on("pointermove.tooltip", function (event) {
  if (event.buttons) { cacherTooltip(); return; }
  const [x, y] = d3.pointer(event, this);
  let proche = null;
  let distance = 36;
  voitures.forEach(function (d) {
   if (!estSelectionnee(d)) return;
   for (let i = 0; i < dimensions.length - 1; i++) {
    const ax = paraX(dimensions[i]), ay = paraY[dimensions[i]](d[dimensions[i]]);
    const bx = paraX(dimensions[i + 1]), by = paraY[dimensions[i + 1]](d[dimensions[i + 1]]);
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    const carre = (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2;
    if (carre <= distance) { distance = carre; proche = d; }
   }
  });
  if (proche) afficherTooltip(event, proche);
  else cacherTooltip();
 }).on("pointerleave.tooltip", cacherTooltip);

	majParallel("parallel");
}


function majParallel(source) {
	if (source !== "parallel") {
		paraEffacerBrush();
	}

	const lignes = d3.select("#parallel").selectAll(".para-lignes path")
		.attr("stroke", function (d) {
			return estSelectionnee(d) ? couleur(d["fuel-type"]) : couleurEfface;
		})
		.attr("stroke-opacity", function (d) {
			return estSelectionnee(d) ? 0.55 : 0.15;
		});

	if (selection !== null) {
		lignes.filter(estSelectionnee).raise();
	}
}


function dimensionParallel(nom) {
	d3.select("#parallel").selectAll(".para-nom")
		.attr("fill", function (dim) {
			return dim === nom ? couleurDimension : "black";
		})
		.style("text-decoration", function (dim) {
			return dim === nom ? "underline" : "none";
		});
}


enregistrerVue({
	nom: "parallel",
	dessiner: dessinerParallel,
	mettreAJour: majParallel,
	changerDimension: dimensionParallel
});
