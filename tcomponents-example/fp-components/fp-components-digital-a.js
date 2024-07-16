
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-digital-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Digital_A")) {
        o.Digital_A = class {
            constructor() {
                this._anchor = null;
                this._root = null;
                this._onclick = null;
                this._active = false;
                this._desc = null;
                this._descDiv = null;
            }
            get parent() {
                return this._anchor;
            }
            get onclick() {
                return this._onclick;
            }
            set onclick(f) {
                this._onclick = f;
            }
            get active() {
                return this._active;
            }
            set active(a) {
                this._active = a == true;
                if (this._root !== null) {
                    this._root.textContent = this._active ? "1" : "0";
                }
                this._updateClassNames();
            }
            get desc() {
                return this._desc;
            }
            set desc(d) {
                this._desc = d;
                if (this._container == null) {
                    return;
                }
                if (!d) {
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
                this._descDiv.textContent = d;
            }
            _createDesc() {
                let descDiv = document.createElement("div");
                descDiv.className = "fp-components-digital-a-desc";
                descDiv.textContent = this._desc;
                this._container.appendChild(descDiv);
                this._descDiv = descDiv;
            }
            _updateClassNames() {
                if (this._root !== null) {
                    this._root.className = "fp-components-digital-a";
                    if (this._active) {
                        this._root.className += " fp-components-digital-a-active";
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
            rebuild() {
                let divContainer = document.createElement("div");
                let divIndicator = document.createElement("div");
                divContainer.className = "fp-components-digital-a-container";
                divIndicator.textContent = this._active ? "1" : "0";
                divContainer.onclick = () => {
                    if (this._onclick !== null) {
                        this._onclick();
                    }
                };
                divContainer.appendChild(divIndicator);
                this._container = divContainer;
                this._root = divIndicator;
                if (this._desc !== null) {
                    this._createDesc();
                }
                this._updateClassNames();
                this._anchor.appendChild(divContainer);
            }
        };
        o.Digital_A.VERSION = "1.4.1";
    }
})(FPComponents);