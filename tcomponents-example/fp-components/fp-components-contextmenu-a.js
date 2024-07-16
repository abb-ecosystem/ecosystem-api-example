
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-contextmenu-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Contextmenu_A")) {
        o.Contextmenu_A = class {
            constructor() {
                this._anchor = null;
                this._root = null;
                this._buttonDiv = null;
                this._backgroundHitAreaDiv = null;
                this._popupMenuDiv = null;
                this._model = {
                    content: []
                };
                this._enabled = true;
            }
            get parent() {
                return this._anchor;
            }
            get model() {
                return this._model;
            }
            set model(m) {
                this._model = m;
                this._createMenuFromModel();
            }
            get enabled() {
                return this._enabled;
            }
            set enabled(e) {
                this._enabled = e ? true : false;
                this._updateClassNames();
                if (!this._enabled) {
                    this.hide();
                }
            }
            _createMenuFromModel() {
                let menuDiv = this._popupMenuDiv;
                if (menuDiv !== null) {
                    while (menuDiv.firstChild) {
                        menuDiv.removeChild(menuDiv.firstChild);
                    }
                }
                if (this._model == null || typeof this._model !== "object" || !Array.isArray(this._model.content)) {
                    throw "Bad model format";
                }
                function div() {
                    return document.createElement("div");
                }
                let atLeastOneIcon = false;
                if (menuDiv !== null) {
                    for (const e of this._model.content) {
                        if (e !== null && typeof e == "object") {
                            if (e.type === "button") {
                                let outerdiv = div();
                                let icondiv = div();
                                let textdiv = div();
                                if (e.enabled === undefined || e.enabled == true) {
                                    outerdiv.className = "fp-components-context-button";
                                } else {
                                    outerdiv.className = "fp-components-context-button fp-components-context-button-disabled";
                                }
                                outerdiv.appendChild(icondiv);
                                outerdiv.appendChild(textdiv);
                                if (e.icon !== undefined) {
                                    icondiv.style.backgroundImage = `url("${e.icon}")`;
                                    atLeastOneIcon = true;
                                }
                                if (e.label !== undefined) {
                                    textdiv.textContent = e.label;
                                }
                                if (e.enabled === undefined || e.enabled == true) {
                                    outerdiv.onclick = () => {
                                        this._backgroundHitAreaDiv.style.display = null;
                                        this._popupMenuDiv.style.display = null;
                                        if (typeof e.onclick === "function") {
                                            e.onclick();
                                        }
                                    };
                                }
                                menuDiv.appendChild(outerdiv);
                            } else if (e.type === "label") {
                                let outerdiv = div();
                                let textdiv = div();
                                let dotline = div();
                                outerdiv.className = "fp-components-context-label";
                                outerdiv.appendChild(textdiv);
                                outerdiv.appendChild(dotline);
                                if (e.label !== undefined) {
                                    textdiv.textContent = e.label;
                                }
                                menuDiv.appendChild(outerdiv);
                            } else if (e.type === "gap") {
                                let gapdiv = div();
                                let linediv = div();
                                gapdiv.className = "fp-components-context-gap";
                                menuDiv.appendChild(gapdiv);
                                gapdiv.appendChild(linediv);
                            }
                        }
                    }
                    if (!atLeastOneIcon) {
                        let icons = menuDiv.querySelectorAll(".fp-components-context-button > :nth-child(1)");
                        for (let i of icons) {
                            i.style.display = "none";
                        }
                    }
                }
            }
            show() {
                if (this._root !== null) {
                    let body = document.getElementsByTagName("body")[0];
                    body.appendChild(this._backgroundHitAreaDiv);
                    body.appendChild(this._popupMenuDiv);
                    let popupMenuDiv = this._popupMenuDiv;
                    let buttonDiv = this._buttonDiv;
                    this._backgroundHitAreaDiv.style.display = "block";
                    popupMenuDiv.style.display = "block";
                    let buttonBcr = buttonDiv.getBoundingClientRect();
                    function setTop(t) {
                        popupMenuDiv.style.top = t + "px";
                    }
                    let top = buttonBcr.top;
                    top += 48;
                    setTop(top);
                    let popupMenuBcr = popupMenuDiv.getBoundingClientRect();
                    let distanceFromBottom = window.innerHeight - popupMenuBcr.bottom;
                    if (distanceFromBottom < 30) {
                        top -= 31 - distanceFromBottom;
                        setTop(top);
                    }
                    popupMenuBcr = popupMenuDiv.getBoundingClientRect();
                    let distanceFromTop = popupMenuBcr.top;
                    if (distanceFromTop < 30) {
                        top += 31 - distanceFromTop;
                        setTop(top);
                    }
                    function setLeft(t) {
                        popupMenuDiv.style.left = t + "px";
                    }
                    let left = buttonBcr.left;
                    left += 0 - popupMenuDiv.offsetWidth / 2 + buttonDiv.offsetWidth / 2;
                    setLeft(left);
                    popupMenuBcr = popupMenuDiv.getBoundingClientRect();
                    let distancefromLeft = popupMenuBcr.left;
                    if (distancefromLeft < 30) {
                        left += 31 - distancefromLeft;
                        setLeft(left);
                    }
                    popupMenuBcr = popupMenuDiv.getBoundingClientRect();
                    let distancefromRight = window.innerWidth - popupMenuBcr.right;
                    if (distancefromRight < 30) {
                        left -= 31 - distancefromRight;
                        setLeft(left);
                    }
                }
            }
            hide() {
                if (this._root !== null) {
                    let body = document.getElementsByTagName("body")[0];
                    try {
                        body.removeChild(this._popupMenuDiv);
                        body.removeChild(this._backgroundHitAreaDiv);
                    } catch (e) {}
                    this._backgroundHitAreaDiv.style.display = null;
                    this._popupMenuDiv.style.display = null;
                }
            }
            _updateClassNames() {
                if (this._root !== null) {
                    this._root.className = "fp-components-base fp-components-context";
                    if (this._enabled) {
                        this._buttonDiv.className = "fp-components-context-basebutton";
                    } else {
                        this._buttonDiv.className = "fp-components-context-basebutton fp-components-context-basebutton-disabled";
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
                function div() {
                    return document.createElement("div");
                }
                let wrapperDiv = div();
                let buttonDiv = div();
                let backgroundHitAreaDiv = div();
                let popupMenuDiv = div();
                wrapperDiv.appendChild(buttonDiv);
                backgroundHitAreaDiv.classList.add("fp-components-context-menu-background");
                popupMenuDiv.classList.add("fp-components-context-menu");
                this._root = wrapperDiv;
                this._buttonDiv = buttonDiv;
                this._backgroundHitAreaDiv = backgroundHitAreaDiv;
                this._popupMenuDiv = popupMenuDiv;
                buttonDiv.onclick = () => {
                    if (this._enabled) {
                        this.show();
                    }
                };
                backgroundHitAreaDiv.onmousedown = () => {
                    this.hide();
                };
                this._updateClassNames();
                this._anchor.appendChild(wrapperDiv);
                if (this._model !== null) {
                    this._createMenuFromModel();
                }
            }
        };
        o.Contextmenu_A.VERSION = "1.4.1";
    }
})(FPComponents);