
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-piechart-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Piechart_A")) {
        o.Piechart_A = class {
            constructor() {
                this._anchor = null;
                this._root = null;
                this._size = 300;
                this._donut = true;
                this._showLabels = true;
                this._labelsBelow = false;
                this._model = [];
                this._hue = 225;
                this._multiHue = false;
                this._centerText = "";
                this._topText = "";
                this._bottomText = "";
                this.__selected = null;
                this._onselection = null;
                this._dirty = false;
            }
            get parent() {
                return this._anchor;
            }
            get size() {
                return this._size;
            }
            set size(s) {
                let old = this._size;
                this._size = Number.parseFloat(s);
                if (old !== this._size) {
                    this._update();
                }
            }
            get donut() {
                return this._donut;
            }
            set donut(d) {
                let old = this._donut;
                this._donut = d == true;
                if (old !== this._donut) {
                    this._update();
                }
            }
            get showLabels() {
                return this._showLabels;
            }
            set showLabels(sl) {
                let old = this._showLabels;
                this._showLabels = sl == true;
                if (old !== this._showLabels) {
                    this._update();
                }
            }
            get labelsBelow() {
                return this._labelsBelow;
            }
            set labelsBelow(lb) {
                let old = this._labelsBelow;
                this._labelsBelow = lb === true;
                if (old !== this._labelsBelow) {
                    this._update();
                }
            }
            get model() {
                return this._model;
            }
            set model(m) {
                if (!Array.isArray(m)) {
                    console.error("PieChart: Model is not an array.");
                    return;
                }
                for (let e of m) {
                    if (!Array.isArray(e)) {
                        console.error("PieChart: Sector entry is not an array.");
                    }
                }
                this._model = m;
                this._update();
            }
            appendData(value, label, color = null) {
                this._model.push([ value, label, color ]);
                this._update();
            }
            clearData() {
                this._model = [];
                this._update();
            }
            get hue() {
                return this._hue;
            }
            set hue(h) {
                let h2 = Number.parseFloat(h);
                h2 %= 360;
                while (h2 < 0) {
                    h2 += 360;
                }
                if (h2 === -0) {
                    h2 = 0;
                }
                this._hue = h2;
                this._update();
            }
            get multiHue() {
                return this._multiHue;
            }
            set multiHue(mh) {
                let old = this._multiHue;
                this._multiHue = mh == true;
                if (old !== this._multiHue) {
                    this._update();
                }
            }
            get centerText() {
                return this._centerText;
            }
            set centerText(ct) {
                this._centerText = ct;
                this._update();
            }
            get topText() {
                return this._topText;
            }
            set topText(tt) {
                this._topText = tt;
                this._update();
            }
            get bottomText() {
                return this._bottomText;
            }
            set bottomText(bt) {
                this._bottomText = bt;
                this._update();
            }
            get selected() {
                return this._selected;
            }
            set selected(s) {
                let old = this._selected;
                if (Number.isInteger(s) && s < this._model.length && s >= 0) {
                    this._selected = s;
                } else {
                    this._selected = null;
                }
                if (old !== this._selected) {
                    this._update();
                }
            }
            get _selected() {
                return this.__selected;
            }
            set _selected(s) {
                this.__selected = s;
                if (this._onselection !== null && typeof this._onselection === "function") {
                    if (this.__selected === null) {
                        this._onselection(null, null);
                    } else {
                        this._onselection(this.__selected, this._model[this.__selected][0]);
                    }
                }
            }
            get onselection() {
                return this._onselection;
            }
            set onselection(os) {
                this._onselection = os;
            }
            attachToId(nodeId) {
                let element = document.getElementById(nodeId);
                if (element === null) {
                    console.log("Could not find element with id: " + nodeId);
                    return false;
                }
                return this.attachToElement(element);
            }
            attachToElement(element) {
                this._anchor = element;
                return this.rebuild();
            }
            _update() {
                if (!this._dirty) {
                    this._dirty = true;
                    setTimeout(() => {
                        this._update();
                    }, 0);
                    return;
                }
                this._dirty = false;
                function createEmSvg(tag) {
                    return document.createElementNS("http://www.w3.org/2000/svg", tag);
                }
                function calcCoordinate(centerX, centerY, radius, deg) {
                    if (isNaN(deg)) {
                        deg = 0;
                    }
                    var radians = (deg - 90 + ROTATION) * (Math.PI / 180);
                    return {
                        x: centerX + radius * Math.cos(radians),
                        y: centerY + radius * Math.sin(radians)
                    };
                }
                if (!this._root) {
                    return;
                }
                if (this._selected >= this._model.length) {
                    this._selected = null;
                }
                const SIZE = this._size;
                const CENTER_X = 99.5;
                const CENTER_Y = 99.5;
                const RADIUS = 90;
                const THICKNESS = this._donut ? 25 : 90;
                const SELECTED_THICKNESS_MOD = 3;
                const ROTATION = 0;
                const SECTORS = this._model;
                const LIGHTNESS_MAX = 85;
                const LIGHTNESS_MIN = 25;
                const LIGHTNESS_STEP = SECTORS.length > 1 ? (LIGHTNESS_MAX - LIGHTNESS_MIN) / (SECTORS.length - 1) : 0;
                const SATURATION_MAX = 100;
                const SATURATION_MIN = 50;
                const SATURATION_STEP = SECTORS.length > 1 ? (SATURATION_MAX - SATURATION_MIN) / (SECTORS.length - 1) : 0;
                const HUE_STEP = SECTORS.length > 1 ? 360 / SECTORS.length : 0;
                const CENTER_TEXT_FONT_BASE = 36;
                const TOP_TEXT_FONT_BASE = 20;
                const TOP_TEXT_OFFSET = -30;
                const BOTTOM_TEXT_FONT_BASE = 20;
                const BOTTOM_TEXT_OFFSET = 30;
                let total = 0;
                let sectorColors = [];
                for (let i = 0; i < SECTORS.length; i++) {
                    let sectorsEntry = SECTORS[i];
                    total += sectorsEntry[0];
                    if (!sectorsEntry[2]) {
                        if (this._multiHue) {
                            sectorColors[i] = [ "hsl(", `${(this._hue + HUE_STEP * i * 2 + (SECTORS.length % 2 === 0 && i >= SECTORS.length / 2 ? HUE_STEP : 0)) % 360},`, `${SATURATION_MAX - SATURATION_STEP * i}%,`, `${LIGHTNESS_MIN + LIGHTNESS_STEP * i}%`, ")" ].join("");
                        } else {
                            sectorColors[i] = `hsl(${this._hue},${SATURATION_MAX - SATURATION_STEP * i}%,${LIGHTNESS_MIN + LIGHTNESS_STEP * i}%)`;
                        }
                    } else {
                        sectorColors[i] = sectorsEntry[2];
                    }
                }
                let svg = createEmSvg("svg");
                svg.setAttribute("width", SIZE);
                svg.setAttribute("height", SIZE);
                svg.setAttribute("viewBox", "0 0 200 200");
                let offset = 0;
                let offsetSelected = 0;
                const createSector = i => {
                    let isSelected = this._selected === i;
                    if (isSelected) {
                        offsetSelected = offset;
                    }
                    let sector = SECTORS[i];
                    let sectorDegrees = sector[0] / total * 360;
                    if (sectorDegrees >= 360) {
                        sectorDegrees = 359.99;
                    }
                    let color = sectorColors[i];
                    let path = createEmSvg("path");
                    path.setAttribute("fill", color);
                    path.setAttribute("stroke", this._donut && !isSelected ? "white" : "none");
                    path.setAttribute("stroke-linejoin", "none");
                    path.setAttribute("stroke-width", "1");
                    let outerRadius = RADIUS + (isSelected ? SELECTED_THICKNESS_MOD : 0);
                    let innerRadius = RADIUS - THICKNESS + (isSelected && this._donut ? -SELECTED_THICKNESS_MOD : 0);
                    let p0 = calcCoordinate(CENTER_X, CENTER_Y, outerRadius, offset);
                    let p1 = calcCoordinate(CENTER_X, CENTER_Y, outerRadius, offset + sectorDegrees);
                    let p2 = calcCoordinate(CENTER_X, CENTER_Y, innerRadius, offset + sectorDegrees);
                    let p3 = calcCoordinate(CENTER_X, CENTER_Y, innerRadius, offset);
                    path.setAttribute("d", [ `M${p0.x},${p0.y}`, `A${outerRadius},${outerRadius} 0 ${sectorDegrees > 180 ? 1 : 0},1 ${p1.x},${p1.y}`, `L${p2.x},${p2.y}`, `A${innerRadius},${innerRadius} 0 ${sectorDegrees > 180 ? 1 : 0},0 ${p3.x},${p3.y}`, "Z" ].join(" "));
                    path.onclick = e => {
                        e.stopPropagation();
                        this._selected = this._selected === i ? null : i;
                        this._update();
                    };
                    svg.appendChild(path);
                    offset += sectorDegrees;
                };
                for (let i = 0; i < SECTORS.length; i++) {
                    createSector(i);
                }
                if (this._selected !== null) {
                    offset = offsetSelected;
                    createSector(this._selected);
                }
                let centerText;
                if (this._donut && this._centerText) {
                    centerText = createEmSvg("text");
                    centerText.textContent = this._centerText;
                    centerText.setAttribute("x", `${CENTER_X}`);
                    centerText.setAttribute("y", `${CENTER_Y}`);
                    centerText.setAttribute("text-anchor", "middle");
                    centerText.setAttribute("dy", "0.35em");
                    centerText.setAttribute("style", `font-size: ${CENTER_TEXT_FONT_BASE}px; font-weight: bold;`);
                    svg.appendChild(centerText);
                }
                let topText;
                if (this._donut && this._topText) {
                    topText = createEmSvg("text");
                    topText.textContent = this._topText;
                    topText.setAttribute("x", `${CENTER_X}`);
                    topText.setAttribute("y", `${CENTER_Y + TOP_TEXT_OFFSET}`);
                    topText.setAttribute("text-anchor", "middle");
                    topText.setAttribute("dy", "0.35em");
                    topText.setAttribute("style", `font-size: ${TOP_TEXT_FONT_BASE}px; font-weight: bold;`);
                    svg.appendChild(topText);
                }
                let bottomText;
                if (this._donut && this._bottomText) {
                    bottomText = createEmSvg("text");
                    bottomText.textContent = this._bottomText;
                    bottomText.setAttribute("x", `${CENTER_X}`);
                    bottomText.setAttribute("y", `${CENTER_Y + BOTTOM_TEXT_OFFSET}`);
                    bottomText.setAttribute("text-anchor", "middle");
                    bottomText.setAttribute("dy", "0.35em");
                    bottomText.setAttribute("style", `font-size: ${BOTTOM_TEXT_FONT_BASE}px; font-weight: bold;`);
                    svg.appendChild(bottomText);
                }
                let labelsContainer = null;
                if (this._showLabels) {
                    labelsContainer = document.createElement("div");
                    labelsContainer.className = "fp-components-pie-chart-labelscontainer";
                    labelsContainer.style.maxWidth = `${SIZE}px`;
                    if (this._labelsBelow) {
                        labelsContainer.style.flexDirection = "row";
                        labelsContainer.style.flexWrap = "wrap";
                        labelsContainer.style.justifyContent = "center";
                    } else {
                        labelsContainer.style.flexDirection = null;
                        labelsContainer.style.flexWrap = null;
                        labelsContainer.style.justifyItems = null;
                    }
                    for (let i = 0; i < SECTORS.length; i++) {
                        let sector = SECTORS[i];
                        let labelWrapper = document.createElement("div");
                        labelWrapper.className = "fp-components-pie-chart-labelwrapper";
                        if (this._selected === i) {
                            labelWrapper.className += " fp-components-pie-chart-labelwrapper-selected";
                        }
                        let colorBox = document.createElement("div");
                        colorBox.style.backgroundColor = sectorColors[i];
                        labelWrapper.appendChild(colorBox);
                        let name = document.createElement("div");
                        name.textContent = sector[1];
                        labelWrapper.appendChild(name);
                        let value = document.createElement("div");
                        value.textContent = `${sector[0]}`;
                        labelWrapper.appendChild(value);
                        labelWrapper.onclick = e => {
                            e.stopPropagation();
                            this._selected = this._selected === i ? null : i;
                            this._update();
                        };
                        labelsContainer.appendChild(labelWrapper);
                    }
                }
                while (this._root.firstChild) {
                    this._root.removeChild(this._root.lastChild);
                }
                this._root.style.flexDirection = this._labelsBelow ? "column" : null;
                this._root.appendChild(svg);
                if (labelsContainer !== null) {
                    this._root.appendChild(labelsContainer);
                }
                function adjust(element, baseSize, widthFactor) {
                    let fontSize = baseSize;
                    while (element.getBBox().width > widthFactor * (RADIUS - THICKNESS) && fontSize > 1) {
                        fontSize--;
                        element.setAttribute("style", `font-size: ${fontSize}px; font-weight: bold;`);
                    }
                }
                if (this._donut && this._centerText) {
                    adjust(centerText, CENTER_TEXT_FONT_BASE, 1.6);
                }
                if (this._donut && this._topText) {
                    adjust(topText, TOP_TEXT_FONT_BASE, 1.3);
                }
                if (this._donut && this._bottomText) {
                    adjust(bottomText, BOTTOM_TEXT_FONT_BASE, 1.3);
                }
            }
            rebuild() {
                if (this._anchor === null) {
                    return false;
                }
                while (this._anchor.firstChild) {
                    this._anchor.removeChild(this._anchor.lastChild);
                }
                let root = document.createElement("div");
                root.className = "fp-components-base fp-components-pie-chart";
                root.onclick = () => {
                    this._selected = null;
                    this._update();
                };
                this._root = root;
                this._anchor.appendChild(root);
                this._update();
            }
        };
        o.Piechart_A.VERSION = "1.4.1";
    }
})(FPComponents);