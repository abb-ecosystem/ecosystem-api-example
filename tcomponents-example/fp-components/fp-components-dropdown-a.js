
// (c) Copyright 2020-2023 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.2

'use strict';

fpComponentsLoadCSS("fp-components/fp-components-dropdown-a.css");

var FPComponents = FPComponents || {};
(function (o) {

    if (!o.hasOwnProperty("Dropdown_A")) {
        o.Dropdown_A = class {

            constructor() {
                this._anchor = null;                
                this._root = null;
                this._descDiv = null;
                this._container = null;
                this._canvasArrow = null;

                this._onselection = null;
                this._enabled = true;
                this._model = null;
                this._selected = null;
                this._desc = null;
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
                if (this._root !== null && !this._root._enabled) {
                    this._root.getElementsByTagName("div")[0].style.display = "none";
                }
                this._drawArrow();
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

                if(this._container === null) {
                    return;
                }

                if(!l) {
                    this._container.removeChild(this._descDiv);
                    this._descDiv = null;
                    return;
                }

                if(this._descDiv === null) {
                    this._createDesc();
                    return;
                }

                this._descDiv.textContent = l;
            }

            get selected() {
                return this._selected;
            }

            set selected(s) {

                if (s !== null) {
                    if (typeof(s) !== "number" || s < 0) {
                        console.log("Dropdown selection must be an index number");
                        return;
                    }
                }
                
                this._selected = s;

                if (this._root !== null) {
                    
                    let divMenu = this._root.getElementsByTagName("div")[0];
                    let items = divMenu.getElementsByTagName("p");
                    
                    for (let i=0; i<items.length; i++) {
                        if (s===null || s != i) {
                            items[i].style.backgroundColor = null;
                            items[i].style.color = null;
                        } else {
                            items[i].style.backgroundColor = "var(--fp-color-BLUE-60)";
                            items[i].style.color = "var(--fp-color-WHITE)";
                        }
                    }

                    if (this._model === null) {
                        this._root.getElementsByTagName("p")[0].innerHTML = "&nbsp;";
                    } else {
                        if (s!== null && this._model.items !== undefined && this._model.items.length >= s + 1) {
                            this._root.getElementsByTagName("p")[0].textContent = this._model.items[s].toString();
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
    
                let element  = document.getElementById(nodeId);
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
                    ctx.lineTo(12,3);
                    ctx.strokeStyle = this._enabled ? "#333333" : "#999999";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            rebuild() {

                if (this._model === null || this._anchor === null) {
                    return false;
                }

                while (this._anchor.firstChild) {
                    this._anchor.removeChild(this._anchor.firstChild);
                }

                this._canvasArrow   = document.createElement("canvas");

                let divContainer    = document.createElement("div");
                let divBox          = document.createElement("div");
                let pBox            = document.createElement("p");
                let divOverlay      = document.createElement("div");
                let divMenu         = document.createElement("div");
                
                divBox.onclick = ()=> {
                    if (this._enabled) {
                        divOverlay.style.display = "block";
                        divMenu.style.display = "block";

                        divMenu.style.minWidth = `${divBox.offsetWidth}px`;

                        let bcrBox = divBox.getBoundingClientRect();

                        let top = bcrBox.top - (divMenu.offsetHeight/2) + (divBox.offsetHeight/2);
                        divMenu.style.top = top + "px";

                        let left = bcrBox.left;
                        divMenu.style.left = left + "px";

                        let bcr = divMenu.getBoundingClientRect();
                        let distanceFromBottom = window.innerHeight - bcr.bottom;
                        if (distanceFromBottom < 30) {
                            top -= 31 - distanceFromBottom;
                            divMenu.style.top = top + "px";
                        }

                        bcr = divMenu.getBoundingClientRect();
                        let distanceFromTop = bcr.top;
                        if (distanceFromTop < 30) {
                            top += 31 - distanceFromTop;
                            divMenu.style.top = top + "px";
                        }

                        bcr = divMenu.getBoundingClientRect();
                        distanceFromBottom = window.innerHeight - bcr.bottom;
                        if (distanceFromBottom < 30) {
                            divMenu.style.maxHeight = (window.innerHeight - 70) + "px";
                        }

                        // Scroll to the selected item, when dropdown menu opens
                        if(typeof this._selected === "number") {
                            divMenu.scrollTop = divMenu.children[this._selected].offsetTop - ((divMenu.offsetHeight / 2) - (divMenu.children[this._selected].offsetHeight / 2));    
                        }
                    }
                };

                divBox.appendChild(pBox);
                
                this._canvasArrow.height = 12;
                this._canvasArrow.width = 15;
                this._drawArrow();
                divBox.appendChild(this._canvasArrow);

                divMenu.className = "fp-components-dropdown-menu";
                divOverlay.className = "fp-components-dropdown-overlay";
                divBox.appendChild(divMenu);
                divBox.appendChild(divOverlay);

                let items = this._model.items;
                if (items !== undefined && Array.isArray(items)) {
                    for (let i=0; i<items.length; i++) {
                        
                        let item = items[i];
                        let pItem = document.createElement("p");
                        pItem.textContent = item.toString();
                        
                        pItem.onclick = (e)=> {

                            e.stopPropagation();
                            
                            divMenu.style.display = "none";
                            divOverlay.style.display = "none";
                            if (!this._enabled) {
                                return;
                            }
                                this.selected = i;
                            
                            if (typeof this._onselection === "function") {
                                this._onselection(i, item);
                            }
                        }
                        divMenu.appendChild(pItem);
                        
                    }
                }

                divOverlay.onclick = (e) => {
                    e.stopPropagation();
                    divOverlay.style.display = "none";
                    divMenu.style.display = "none";
                }

                divContainer.appendChild(divBox);

                this._root = divBox;
                this._container = divContainer;

                if(this._desc) {
                    this._createDesc();
                }

                this._updateClassNames();
                
                this._anchor.appendChild(divContainer); 
                this.selected = this._selected;

                return true;

            }         
        }

        o.Dropdown_A.VERSION = "1.2";

    }

})(FPComponents); 
