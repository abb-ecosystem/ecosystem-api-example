
// (c) Copyright 2020-2023 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.2

'use strict';

fpComponentsLoadCSS("fp-components/fp-components-foldin-a.css");

var FPComponents = FPComponents || {};
(function (o) {

    if (!o.hasOwnProperty("Foldin_A")) {
        o.Foldin_A = class {

            constructor() {
                this._anchor = null;

                this._width = "35vw";
                this._contentId = null;

                this._show = false;

                this._foldinOuterDiv = null;
                this._foldinInnerDiv = null;
                this._glassDiv = null;
            }

            get parent() {
                return this._anchor;
            }

            get width() {
                return this._width;
            }

            set width(w) {
                if (typeof w === "string") {
                    this._width = w;
                } else if (typeof w === "number") {
                    this._width = w.toString(10) + "px";
                } else {
                    this._width = w.toString();
                }

                if (this._show === true) {
                    this._foldinOuterDiv.style.width = this._width;
                    this._foldinInnerDiv.style.minWidth = this._width;
                }
            }

            get contentId() {
                return this._contentId;
            }

            set contentId(cId) {

                this._contentId = cId === null ? null : cId.toString();
                
                if (this._foldinInnerDiv !== null) {
                    if (this._contentId === null) {
                        this._foldinInnerDiv.removeAttribute("id");
                    } else {
                        this._foldinInnerDiv.id = this._contentId;
                    }
                }
            }
    
            attachToBody() {
    
                let element = document.getElementsByTagName("body")[0];
                if (element === null) {
                    console.log("Could not find body element");
                    return false;
                }

                this._anchor = element;
                return this.rebuild();
            }

            rebuild() {
                
                if (this._anchor !== null) {

                    let anchor = this._anchor;

                    let foldinInnerDiv = document.createElement("div");
                    foldinInnerDiv.className = "fp-components-foldin-inner";
                    if (this._contentId !== null) foldinInnerDiv.id = this._contentId;
                    foldinInnerDiv.style.width = this._width;
                    
                    let foldinOuterDiv = document.createElement("div");
                    foldinOuterDiv.className = "fp-components-base fp-components-foldin";
                    
                    let glassDiv = document.createElement("div");
                    glassDiv.className = "fp-components-foldin-glasspane";
                    glassDiv.onclick = ()=>{this.hide();};

                    foldinOuterDiv.appendChild(foldinInnerDiv);

                    anchor.appendChild(foldinOuterDiv);
                    anchor.appendChild(glassDiv);
                    this._foldinInnerDiv = foldinInnerDiv;
                    this._foldinOuterDiv = foldinOuterDiv;
                    this._glassDiv = glassDiv;
                    
                }
            }

            show() {

                if (this._show === true) {
                    return;
                }
                this._show = true;

                if (this._foldinOuterDiv !== null) {

                    this._glassDiv.style.display = "block";

                    this._foldinOuterDiv.style.width = this._width;
                    this._foldinInnerDiv.style.minWidth = this._width;

                    /*let s = this._anchor.children.length;
                    for (let i = 0; i < s; i++) {
                        let n = this._anchor.children[i];
                        if (!n.isSameNode(this._foldinOuterDiv) && !n.isSameNode(this._glassDiv) && !n.id.startsWith("fp-debugwindow")) {
                            n.setAttribute("filter-backup", n.style.filter);
                            n.style.filter = n.getAttribute("filter-backup") + " blur(8px)";
                        }
                    }*/
                }
            }


            hide() {

                if (this._show === false) {
                    return;
                }
                this._show = false;

                if (this._foldinOuterDiv !== null) {

                    this._glassDiv.style.display = "none";
                    this._foldinOuterDiv.style.width = "0";

                    /*let s = this._anchor.children.length;
                    for (let i = 0; i < s; i++) {
                        let n = this._anchor.children[i];
                        if (!n.isSameNode(this._foldinOuterDiv) && !n.isSameNode(this._glassDiv)  && !n.id.startsWith("fp-debugwindow")) {                            
                            n.style.filter = n.getAttribute("filter-backup");
                        }
                    }*/
                }
            }
        }

        o.Foldin_A.VERSION = "1.2";

    }

})(FPComponents); 
