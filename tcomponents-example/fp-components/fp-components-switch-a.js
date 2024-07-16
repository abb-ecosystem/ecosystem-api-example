
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-switch-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Switch_A")) {
        o.Switch_A = class {
            constructor() {
                this._anchor = null;
                this._onchange = null;
                this._root = null;
                this._knob = null;
                this._container = null;
                this._enabled = true;
                this._active = false;
                this._scale = 1;
                this._desc = null;
                this._descDiv = null;
            }
            get parent() {
                return this._anchor;
            }
            set onchange(func) {
                this._onchange = func;
            }
            get onchange() {
                return _onchange;
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
            set active(active) {
                if (this._root !== null) {
                    if (active) {
                        this._root.className = "fp-components-switch-button fp-components-switch-button-active";
                        if (this._scale != 1) {
                            this._root.getElementsByTagName("div")[0].style.marginLeft = (16 * this._scale).toString() + "px";
                        }
                    } else {
                        this._root.className = "fp-components-switch-button";
                        if (this._scale != 1) {
                            this._root.getElementsByTagName("div")[0].style.marginLeft = "0";
                        }
                    }
                    if (!this._enabled) {
                        this._root.className += " fp-components-switch-button-disabled";
                    }
                }
                this._active = active;
            }
            get active() {
                return this._active;
            }
            set enabled(enabled) {
                this._enabled = enabled;
                this.active = this._active;
            }
            get enabled() {
                return this._enabled;
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
                if (this._descDiv == null) {
                    this._createDesc();
                    return;
                }
                this._descDiv.textContent = d;
            }
            _createDesc() {
                let divdesc = document.createElement("span");
                divdesc.className = "fp-components-switch-button-desc";
                divdesc.textContent = this._desc;
                this._container.appendChild(divdesc);
                this._descDiv = divdesc;
            }
            handleClick() {
                if (this._enabled === true) {
                    if (this._active === true) {
                        this.active = false;
                    } else {
                        this.active = true;
                    }
                    if (this._onchange != null) {
                        this._onchange(this._active);
                    }
                }
            }
            rebuild() {
                if (this._anchor != null) {
                    let divContainer = document.createElement("div");
                    let divOuter = document.createElement("div");
                    let divKnob = document.createElement("div");
                    divOuter.appendChild(divKnob);
                    divContainer.className = "fp-components-switch-container";
                    divContainer.onclick = () => this.handleClick();
                    divContainer.appendChild(divOuter);
                    this._container = divContainer;
                    this._root = divOuter;
                    this._knob = divKnob;
                    if (this._desc !== null) {
                        this._createDesc();
                    }
                    this._anchor.appendChild(this._container);
                    this.active = this._active;
                    if (this._scale !== 1) {
                        this.scale = this._scale;
                    }
                }
            }
            set scale(s) {
                this._scale = Number.parseFloat(s);
                if (this._root !== null) {
                    if (s == 1) {
                        this._root.style.borderRadius = null;
                        this._root.style.height = null;
                        this._root.style.width = null;
                        this._knob.style.borderRadius = null;
                        this._knob.style.borderWidth = null;
                        this._knob.style.height = null;
                        this._knob.style.width = null;
                        this._knob.style.marginLeft = null;
                    } else {
                        this._root.style.borderRadius = (12 * s).toString() + "px";
                        this._root.style.height = (24 * s).toString() + "px";
                        this._root.style.width = (40 * s).toString() + "px";
                        this._knob.style.borderRadius = (12 * s).toString() + "px";
                        this._knob.style.borderWidth = (3 * s).toString() + "px";
                        this._knob.style.height = (24 * s).toString() + "px";
                        this._knob.style.width = (24 * s).toString() + "px";
                        if (this._active) {
                            this._knob.style.marginLeft = (16 * s).toString() + "px";
                        } else {
                            this._knob.style.marginLeft = "0";
                        }
                    }
                }
            }
            get scale() {
                return this._scale;
            }
        };
        o.Switch_A.VERSION = "1.4.1";
    }
})(FPComponents);