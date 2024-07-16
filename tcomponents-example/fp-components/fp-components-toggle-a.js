
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-toggle-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Toggle_A")) {
        o.Toggle_A = class {
            constructor() {
                this._anchor = null;
                this._root = null;
                this._model = null;
                this._toggleState = [];
                this._multi = false;
                this._singleAllowNone = false;
                this._onclick = null;
            }
            get parent() {
                return this._anchor;
            }
            get model() {
                return this._model;
            }
            set model(m) {
                this._model = m;
                this._updateFromModel();
            }
            get multi() {
                return this._multi;
            }
            set multi(m) {
                this._multi = m == true;
            }
            get singleAllowNone() {
                return this._singleAllowNone;
            }
            set singleAllowNone(s) {
                this._singleAllowNone = s == true;
            }
            get onclick() {
                return this._onclick;
            }
            set onclick(o) {
                if (o !== null && typeof o !== "function") {
                    throw "onclick must be null or a function";
                }
                this._onclick = o;
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
                return this._build();
            }
            setToggled(index, toggled = null, noLimitations = false) {
                if (noLimitations) {
                    if (toggled === null) {
                        toggled = !this._toggleState[index];
                    } else {
                        toggled = toggled == true;
                    }
                    this._toggleState[index] = toggled;
                    this._updateFromModel();
                } else {
                    this._setToggled(index, toggled, false);
                }
            }
            getToggledList() {
                let ret = [];
                for (const b of this._toggleState) {
                    ret.push(b);
                }
                return ret;
            }
            doToggle(index, t) {
                this._toggleState[index] = t;
                this._root.children[index].className = t ? "fp-components-toggle-on" : "";
                this._updateIcon(index, t);
            }
            _updateIcon(index, t) {
                var container = this._root.children[index];
                var img = container.getElementsByClassName("fp-components-toggle-icon")[0];
                if (Array.isArray(this._model)) {
                    var item = this._model[index];
                    var icon = t ? item.toggledIcon ? item.toggledIcon : item.icon : item.icon;
                    if (icon) {
                        container.style.padding = "6px 16px 6px 16px";
                        img.style.backgroundImage = `url("${icon}")`;
                        img.style.marginRight = "8px";
                    } else {
                        container.style.padding = "6px 32px 6px 8px";
                        img.style.backgroundImage = "none";
                        img.style.marginRight = "initial";
                    }
                }
            }
            _setToggled(index, toggled = null, fireCallback = false) {
                if (typeof index !== "number" || index < 0 || index > this._toggleState.length - 1) {
                    return;
                }
                if (toggled === null) {
                    toggled = !this._toggleState[index];
                } else {
                    toggled = toggled == true;
                    if (this._toggleState[index] == toggled) {
                        return;
                    }
                }
                let changed = [];
                let that_ = this;
                function handleChange(index, t) {
                    if (that_._toggleState[index] !== t) {
                        changed.push([ index, t ]);
                    }
                }
                if (this._multi) {
                    handleChange(index, toggled);
                    this.doToggle(index, toggled);
                } else {
                    if (toggled) {
                        handleChange(index, toggled);
                        this.doToggle(index, true);
                        for (let i = 0; i < this._toggleState.length; i++) {
                            if (i !== index) {
                                handleChange(i, false);
                                this.doToggle(i, false);
                            }
                        }
                    } else {
                        if (this._singleAllowNone) {
                            handleChange(index, false);
                            this.doToggle(index, false);
                        }
                    }
                }
                if (fireCallback && this._onclick !== null && changed.length > 0) {
                    let all = this.getToggledList();
                    this._onclick({
                        changed: changed,
                        all: all
                    });
                }
            }
            isToggled(index) {
                if (typeof index !== "number" || index < 0 || index > this._toggleState.length - 1) {
                    return undefined;
                }
                return this._toggleState[index];
            }
            _updateFromModel() {
                if (this._root == null) {
                    return;
                }
                while (this._root.firstChild) {
                    this._root.removeChild(this._root.firstChild);
                }
                if (Array.isArray(this._model)) {
                    let i = 0;
                    for (const item of this._model) {
                        let button = document.createElement("div");
                        let img = document.createElement("div");
                        let label = document.createElement("div");
                        img.className = "fp-components-toggle-icon";
                        label.textContent = item.text;
                        button.appendChild(img);
                        button.appendChild(label);
                        var that = this;
                        const index = i;
                        button.onclick = () => {
                            that._setToggled(index, null, true);
                        };
                        this._root.appendChild(button);
                        if (this._toggleState.length <= i) {
                            this._toggleState.push(false);
                        } else {
                            this.doToggle(i, this._toggleState[i]);
                        }
                        this._updateIcon(i, this._toggleState[i]);
                        i++;
                    }
                }
            }
            _build() {
                while (this._anchor.firstChild) {
                    this._anchor.removeChild(this._anchor.firstChild);
                }
                let root = document.createElement("div");
                root.className = "fp-components-base fp-components-toggle";
                this._root = root;
                this._anchor.appendChild(root);
                this._updateFromModel();
            }
        };
        o.Toggle_A.VERSION = "1.4.1";
    }
})(FPComponents);