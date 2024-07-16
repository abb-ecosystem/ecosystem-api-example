
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-input-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Input_A")) {
        o.Input_A = class {
            constructor() {
                this._anchor = null;
                this._root = null;
                this._descDiv = null;
                this._container = null;
                this._enabled = true;
                this._text = "";
                this._highlight = false;
                this._onchange = null;
                this._label = null;
                this._regex = null;
                this._validator = null;
                this._variant = null;
                this._desc = null;
            }
            get parent() {
                return this._anchor;
            }
            get enabled() {
                return this._enabled;
            }
            set enabled(e) {
                this._enabled = e ? true : false;
                this._updateClassNames();
            }
            get text() {
                return this._text;
            }
            set text(t) {
                this._text = t;
                if (this._root !== null) {
                    this._root.getElementsByTagName("p")[0].textContent = this._text;
                }
            }
            get onchange() {
                return this._onchange;
            }
            set onchange(callback) {
                this._onchange = callback;
            }
            get label() {
                return this._label;
            }
            set label(l) {
                this._label = l;
            }
            get regex() {
                return this._regex;
            }
            set regex(r) {
                this._regex = r;
            }
            get validator() {
                return this._validator;
            }
            set validator(v) {
                this._validator = v;
            }
            get variant() {
                return this._variant;
            }
            set variant(v) {
                this._variant = v;
            }
            get desc() {
                return this._desc;
            }
            set desc(d) {
                this._desc = d;
                if (!this._container) {
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
                let divdesc = document.createElement("span");
                divdesc.className = "fp-components-input-desc";
                divdesc.textContent = this._desc;
                this._container.prepend(divdesc);
                this._descDiv = divdesc;
            }
            _updateClassNames() {
                if (this._root !== null) {
                    if (this._enabled === true) {
                        this._root.className = "fp-components-input";
                    } else {
                        this._root.className = "fp-components-input fp-components-input-disabled";
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
                divContainer.className = "fp-components-input-container";
                let divField = document.createElement("div");
                let pText = document.createElement("p");
                pText.textContent = this._text;
                divField.appendChild(pText);
                divContainer.appendChild(divField);
                divField.onclick = () => {
                    if (this._enabled === true) {
                        this._root.style.borderColor = "rgb(0,120,215)";
                        fpComponentsKeyboardShow(result => {
                            this._root.style.borderColor = null;
                            if (result !== null) {
                                this.text = result;
                                if (this._onchange !== null && typeof this._onchange === "function") {
                                    this._onchange(this._text);
                                }
                            }
                        }, this._text, this._label, this._variant, this._regex, this._validator);
                    }
                };
                this._container = divContainer;
                this._root = divField;
                if (this._desc !== null) {
                    this._createDesc();
                }
                this._updateClassNames();
                this._anchor.appendChild(divContainer);
            }
        };
        o.Input_A.VERSION = "1.4.1";
    }
})(FPComponents);