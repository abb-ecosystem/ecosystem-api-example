
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-dropdown-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Dropdown_A")) {
        o.Dropdown_A = class {
            constructor() {
                this._leftTruncate = false;
                this._anchor = null;
                this._root = null;
                this._descDiv = null;
                this._container = null;
                this._canvasArrow = null;
                this._onselection = null;
                this._enabled = true;
                this.model = {
                    items: []
                };
                this._selected = null;
                this._desc = null;
                this._divOverlay = null;
                this._divMenu = null;
            }
            get parent() {
                return this._anchor;
            }
            get onselection() {
                return this._onselection;
            }
            set onselection(f) {
                this._onselection = f;
            }
            get enabled() {
                return this._enabled;
            }
            set enabled(e) {
                this._enabled = e ? true : false;
                this._updateClassNames();
                if (this._root !== null && !this._enabled) {
                    this._hide();
                }
            }
            get model() {
                return this._model;
            }
            set model(m) {
                this._model = m;
                this.rebuild();
            }
            get desc() {
                return this._desc;
            }
            set desc(l) {
                this._desc = l;
                if (this._container === null) {
                    return;
                }
                if (!l) {
                    if (this._descDiv !== null) {
                        this._container.removeChild(this._descDiv);
                    }
                    this._descDiv = null;
                    return;
                }
                if (this._descDiv === null) {
                    this._createDesc();
                    return;
                }
                this._descDiv.textContent = l;
            }
            get leftTruncate() {
                return this._leftTruncate;
            }
            set leftTruncate(b) {
                this._leftTruncate = b;
                this.rebuild();
            }
            get selected() {
                return this._selected;
            }
            set selected(s) {
                if (s !== null) {
                    if (typeof s !== "number" || s < 0) {
                        console.log("Dropdown selection must be an index number");
                        return;
                    }
                }
                this._selected = s;
                if (this._root !== null) {
                    if (this._divMenu !== null && this._divMenu !== undefined) {
                        let items = this._divMenu.getElementsByTagName("p");
                        for (let i = 0; i < items.length; i++) {
                            if (s === null || s != i) {
                                items[i].style.backgroundColor = null;
                                items[i].style.color = null;
                            } else {
                                items[i].style.backgroundColor = "var(--fp-color-BLUE-60)";
                                items[i].style.color = "var(--fp-color-WHITE)";
                            }
                        }
                    }
                    if (this._model === null) {
                        this._root.getElementsByTagName("p")[0].innerHTML = "&nbsp;";
                    } else {
                        if (s !== null && this._model.items !== undefined && this._model.items.length >= s + 1) {
                            let text = this._model.items[s].toString();
                            if (this._leftTruncate) {
                                text = text.split("").reverse().join("");
                            }
                            this._root.getElementsByTagName("p")[0].textContent = text;
                        } else {
                            this._root.getElementsByTagName("p")[0].innerHTML = "&nbsp;";
                        }
                    }
                }
            }
            _createDesc() {
                let divdesc = document.createElement("span");
                divdesc.textContent = this._desc;
                divdesc.className = "fp-components-dropdown-desc";
                this._container.prepend(divdesc);
                this._descDiv = divdesc;
            }
            _updateClassNames() {
                if (this._root !== null) {
                    if (this._enabled) {
                        this._root.className = "fp-components-dropdown";
                    } else {
                        this._root.className = "fp-components-dropdown fp-components-dropdown-disabled";
                    }
                }
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
            _drawArrow() {
                if (this._canvasArrow !== null) {
                    let ctx = this._canvasArrow.getContext("2d");
                    ctx.clearRect(0, 0, this._canvasArrow.width, this._canvasArrow.height);
                    ctx.beginPath();
                    ctx.moveTo(2, 3);
                    ctx.lineTo(7, 8);
                    ctx.lineTo(12, 3);
                    ctx.strokeStyle = this._enabled ? "#333333" : "#999999";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
            _hide() {
                try {
                    document.body.removeChild(this._divMenu);
                } catch (elementNotFound) {}
                try {
                    document.body.removeChild(this._divOverlay);
                } catch (elementNotFound) {}
            }
            _show() {
                let divBox = this._root;
                this.selected = this.selected;
                this._divMenu.style.minWidth = `${divBox.offsetWidth}px`;
                document.body.appendChild(this._divOverlay);
                document.body.appendChild(this._divMenu);
                let bcrBox = divBox.getBoundingClientRect();
                let top = bcrBox.top - this._divMenu.offsetHeight / 2 + divBox.offsetHeight / 2;
                this._divMenu.style.top = top + "px";
                let left = bcrBox.left;
                this._divMenu.style.left = left + "px";
                let bcr = this._divMenu.getBoundingClientRect();
                let distanceFromBottom = window.innerHeight - bcr.bottom;
                if (distanceFromBottom < 30) {
                    top -= 31 - distanceFromBottom;
                    this._divMenu.style.top = top + "px";
                }
                bcr = this._divMenu.getBoundingClientRect();
                let distanceFromTop = bcr.top;
                if (distanceFromTop < 30) {
                    top += 31 - distanceFromTop;
                    this._divMenu.style.top = top + "px";
                }
                bcr = this._divMenu.getBoundingClientRect();
                distanceFromBottom = window.innerHeight - bcr.bottom;
                if (distanceFromBottom < 30) {
                    this._divMenu.style.maxHeight = window.innerHeight - 70 + "px";
                }
                if (typeof this._selected === "number") {
                    this._divMenu.scrollTop = this._divMenu.children[this._selected].offsetTop - (this._divMenu.offsetHeight / 2 - this._divMenu.children[this._selected].offsetHeight / 2);
                }
            }
            rebuild() {
                if (this._model === null || this._anchor === null) {
                    return false;
                }
                while (this._anchor.firstChild) {
                    this._anchor.removeChild(this._anchor.firstChild);
                }
                this._canvasArrow = document.createElement("canvas");
                let divContainer = document.createElement("div");
                divContainer.className = "fp-components-dropdown-container";
                let divBox = document.createElement("div");
                let pBox = document.createElement("p");
                this._divMenu = document.createElement("div");
                this._divMenu.className = "fp-components-dropdown-menu";
                this._divOverlay = document.createElement("div");
                this._divOverlay.className = "fp-components-dropdown-overlay";
                this._divOverlay.onclick = e => {
                    e.stopPropagation();
                    this._hide();
                };
                let items = this._model.items;
                if (items !== undefined && Array.isArray(items)) {
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        let pItem = document.createElement("p");
                        pItem.textContent = item.toString();
                        pItem.onclick = e => {
                            e.stopPropagation();
                            this._hide();
                            if (!this._enabled) {
                                return;
                            }
                            this.selected = i;
                            if (typeof this._onselection === "function") {
                                this._onselection(i, item);
                            }
                        };
                        this._divMenu.appendChild(pItem);
                    }
                }
                divBox.onclick = () => {
                    if (this._enabled) {
                        this._show();
                    }
                };
                if (this._leftTruncate) {
                    pBox.className = "fp-components-dropdown-selected-truncate-left";
                } else {
                    pBox.className = "fp-components-dropdown-selected-truncate-right";
                }
                divBox.appendChild(pBox);
                this._canvasArrow.height = 12;
                this._canvasArrow.width = 15;
                this._drawArrow();
                divBox.appendChild(this._canvasArrow);
                divContainer.appendChild(divBox);
                this._root = divBox;
                this._container = divContainer;
                if (this._desc) {
                    this._createDesc();
                }
                this._updateClassNames();
                this._anchor.appendChild(divContainer);
                this.selected = this._selected;
                return true;
            }
        };
        o.Dropdown_A.VERSION = "1.4.1";
    }
})(FPComponents);