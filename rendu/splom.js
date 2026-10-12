
const splomMarge = { haut: 10, droite: 10, bas: 30, gauche: 45 };
const splomCote = 780;
const splomTaille = splomCote / dimensions.length;
const splomEspace = 5;
const splomRayon = 1.8;

const splomX = {};
const splomY = {};

dimensions.forEach(function (dim) {
	splomX[dim] = d3.scaleLinear()
		.domain(etendues[dim])
		.range([splomEspace, splomTaille - splomEspace]);
	splomY[dim] = d3.scaleLinear()
		.domain(etendues[dim])
		.range([splomTaille - splomEspace, splomEspace]);
});

const splomBrush = d3.brush()
	.extent([[0, 0], [splomTaille, splomTaille]]);

let splomCelluleActive = null;
let splomEffacement = false;


function splomPaires() {
	const paires = [];
	dimensions.forEach(function (dimY, ligne) {
		dimensions.forEach(function (dimX, colonne) {
			paires.push({ x: dimX, y: dimY, colonne: colonne, ligne: ligne });
		});
	});
	return paires;
}


function splomEffacerBrush() {
	if (splomCelluleActive === null) {
		return;
	}
	splomEffacement = true;
	d3.select(splomCelluleActive).call(splomBrush.move, null);
	splomEffacement = false;
	splomCelluleActive = null;
}


function splomDebutBrush(event, p) {
	if (splomEffacement) {
		return;
	}
	if (splomCelluleActive !== this) {
		splomEffacerBrush();
		splomCelluleActive = this;
	}
}


function splomPendantBrush(event, p) {
	if (splomEffacement || event.selection === null) {
		return;
	}
	const x0 = event.selection[0][0];
	const y0 = event.selection[0][1];
	const x1 = event.selection[1][0];
	const y1 = event.selection[1][1];

	const ids = data.filter(function (d) {
		const px = splomX[p.x](d[p.x]);
		const py = splomY[p.y](d[p.y]);
		return px >= x0 && px <= x1 && py >= y0 && py <= y1;
	}).map(function (d) {
		return d.id;
	});

	setSelection(ids, "splom");
}


function splomFinBrush(event, p) {
	if (splomEffacement) {
		return;
	}
	if (event.selection === null) {
		splomCelluleActive = null;
		setSelection(null, "splom");
	}
}


function dessinerSplom() {
	const svg = d3.select("#splom")
		.append("svg")
		.attr("width", splomCote + splomMarge.gauche + splomMarge.droite)
		.attr("height", splomCote + splomMarge.haut + splomMarge.bas)
		.style("margin", "0 auto")
		.style("user-select", "none")
		.append("g")
		.attr("transform", "translate(" + splomMarge.gauche + "," + splomMarge.haut + ")");

	svg.selectAll(".splom-axe-x")
		.data(dimensions)
		.enter()
		.append("g")
		.attr("class", "splom-axe-x")
		.attr("transform", function (dim, i) {
			return "translate(" + (i * splomTaille) + "," + splomCote + ")";
		})
		.each(function (dim) {
			d3.select(this).call(d3.axisBottom(splomX[dim]).ticks(2).tickFormat(formatAxe).tickSize(3));
		});

	svg.selectAll(".splom-axe-y")
		.data(dimensions)
		.enter()
		.append("g")
		.attr("class", "splom-axe-y")
		.attr("transform", function (dim, i) {
			return "translate(0," + (i * splomTaille) + ")";
		})
		.each(function (dim) {
			d3.select(this).call(d3.axisLeft(splomY[dim]).ticks(3).tickFormat(formatAxe).tickSize(3));
		});

	svg.selectAll(".splom-axe-x text, .splom-axe-y text")
		.style("font-size", "8px");

	const cellules = svg.selectAll(".splom-cellule")
		.data(splomPaires())
		.enter()
		.append("g")
		.attr("class", "splom-cellule")
		.attr("transform", function (p) {
			return "translate(" + (p.colonne * splomTaille) + "," + (p.ligne * splomTaille) + ")";
		});

	cellules.append("rect")
		.attr("width", splomTaille)
		.attr("height", splomTaille)
		.attr("fill", "none")
		.attr("stroke", "#999999")
		.attr("stroke-width", 0.5);

	const diagonale = cellules.filter(function (p) {
		return p.x === p.y;
	});

	diagonale.select("rect")
		.attr("fill", "#f2f2f2");

	diagonale
		.style("cursor", "pointer")
		.on("click", function (event, p) {
			setDimension(p.x);
		});

	diagonale.append("title")
		.text("Afficher cette dimension dans l'histogramme");

	diagonale.append("text")
		.attr("class", "splom-nom")
		.attr("text-anchor", "middle")
		.style("font-size", "9px")
		.style("font-weight", "bold")
		.each(function (p) {
			const morceaux = couperNom(p.x);
			const depart = splomTaille / 2 - (morceaux.length - 1) * 5.5 + 3;
			d3.select(this).selectAll("tspan")
				.data(morceaux)
				.enter()
				.append("tspan")
				.attr("x", splomTaille / 2)
				.attr("y", function (m, i) {
					return depart + i * 11;
				})
				.text(function (m) {
					return m;
				});
		});

	const nuages = cellules.filter(function (p) {
		return p.x !== p.y;
	});

	nuages.each(function (p) {
		d3.select(this).selectAll("circle")
			.data(voitures)
			.enter()
			.append("circle")
			.attr("cx", function (d) {
				return splomX[p.x](d[p.x]);
			})
			.attr("cy", function (d) {
				return splomY[p.y](d[p.y]);
			})
			.attr("r", splomRayon);
	});

	splomBrush
		.on("start", splomDebutBrush)
		.on("brush", splomPendantBrush)
		.on("end", splomFinBrush);

	nuages.call(splomBrush);

	majSplom("splom");
}


function majSplom(source) {
	if (source !== "splom") {
		splomEffacerBrush();
	}

	d3.select("#splom").selectAll("circle")
		.attr("fill", function (d) {
			return estSelectionnee(d) ? couleur(d["fuel-type"]) : couleurEfface;
		})
		.attr("fill-opacity", function (d) {
			return estSelectionnee(d) ? 0.7 : 0.25;
		});
}


function dimensionSplom(nom) {
	const diagonale = d3.select("#splom").selectAll(".splom-cellule").filter(function (p) {
		return p.x === p.y;
	});

	diagonale.select("rect")
		.attr("fill", function (p) {
			return p.x === nom ? "#d9edf4" : "#f2f2f2";
		})
		.attr("stroke", function (p) {
			return p.x === nom ? couleurDimension : "#999999";
		})
		.attr("stroke-width", function (p) {
			return p.x === nom ? 1.5 : 0.5;
		});

	diagonale.select("text")
		.attr("fill", function (p) {
			return p.x === nom ? couleurDimension : "black";
		});
}


enregistrerVue({
	nom: "splom",
	dessiner: dessinerSplom,
	mettreAJour: majSplom,
	changerDimension: dimensionSplom
});
