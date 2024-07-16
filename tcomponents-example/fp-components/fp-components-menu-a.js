
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-menu-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Menu_A")) {
        o.Menu_A = class {
            constructor() {
                this._model = {};
                this._anchor = null;
            }
            get parent() {
                return this._anchor;
            }
            set model(model) {
                this._model = model;
                this.rebuild();
            }
            get model() {
                return this._model;
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
                if (this._anchor != null) {
                    let containerNode = document.createElement("div");
                    containerNode.className = "fp-components-base fp-components-menu-a-container";
                    let content = this._model.content;
                    if (content !== undefined && Array.isArray(content)) {
                        for (let item of content) {
                            if (item.type === "button") {
                                let divNode = document.createElement("div");
                                divNode.className = "fp-components-menu-a-button";
                                if (item.flash !== undefined && item.flash == true) {
                                    divNode.className += " fp-components-menu-a-button-flash";
                                    if (item.flashColor) {
                                        divNode.style.setProperty("--fp-components-menu-flash-color", item.flashColor);
                                    }
                                }
                                if (item.icon !== undefined) {
                                    let imgNode = document.createElement("div");
                                    imgNode.className = "fp-components-menu-a-button-icon";
                                    imgNode.style.backgroundImage = `url("${item.icon}")`;
                                    divNode.appendChild(imgNode);
                                }
                                let pNode = document.createElement("p");
                                if (item.label !== undefined) pNode.appendChild(document.createTextNode(item.label));
                                divNode.appendChild(pNode);
                                containerNode.appendChild(divNode);
                                if (item.arrow !== undefined && (item.arrow === true || item.arrow === "true")) {
                                    let arrowNode = document.createElement("div");
                                    arrowNode.className = "fp-components-menu-a-button-righticon";
                                    arrowNode.style.backgroundImage = 'url("fp-components/img/rightarrow.png")';
                                    divNode.appendChild(arrowNode);
                                }
                                if (item.enabled === false) {
                                    divNode.style.opacity = "0.25";
                                } else {
                                    if (item.onclick !== undefined) divNode.onclick = item.onclick;
                                    divNode.className += " fp-components-menu-a-button-enabled";
                                }
                            } else if (item.type === "gap") {
                                containerNode.appendChild(document.createElement("br"));
                            } else if (item.type === "label") {
                                let divNode = document.createElement("div");
                                divNode.className = "fp-components-menu-a-label";
                                let pNode = document.createElement("p");
                                if (item.label !== undefined) pNode.appendChild(document.createTextNode(item.label));
                                divNode.appendChild(pNode);
                                containerNode.appendChild(divNode);
                            }
                        }
                    }
                    while (this._anchor.firstChild) {
                        this._anchor.removeChild(this._anchor.firstChild);
                    }
                    this._anchor.appendChild(containerNode);
                }
            }
        };
        o.Menu_A.VERSION = "1.4.1";
    }
})(FPComponents);