
// (c) Copyright 2020-2021 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.1

'use strict';

fpComponentsLoadCSS("fp-components/fp-components-checkbox-a.css");

var FPComponents = FPComponents || {};
(function (o) {

    if (!o.hasOwnProperty("Checkbox_A")) {
        o.Checkbox_A = class {

            constructor() {
                this._anchor = null;
                this._root = null;

                this._scale = 1.0;

                this._enabled = true;
                this._onclick = null;
                this._checked = false;
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

            get enabled() {
                return this._enabled;
            }

            set enabled(e) {
                this._enabled = e ? true : false;
                this._updateClassNames();
            }

            get checked() {
                return this._checked;
            }

            set checked(c) {
                this._checked = c ? true : false;
                this._updateClassNames();
            }

            get desc() {
                return this._desc;
            }

            set desc(d) {
                this._desc = d;
                
                if (this._root == null) {
                    return;
                }

                if (!d) {
                    this._root.removeChild(this._descDiv);
                    this._descDiv = null;
                    return;
                }

                if (this._descDiv == null) {
                    this._createDesc(this._root);
                    return;
                }

                this._descDiv.textContent = d;
            }

            _createDesc(parent) {
                let divdesc = document.createElement("span");

                divdesc.className = "fp-components-checkbox-desc";
                divdesc.textContent = this._desc;

                parent.appendChild(divdesc);

                this._descDiv = divdesc;
            }

            _updateClassNames() {
                if (this._root !== null) {
                    if (this._checked == true) {
                        this._root.className = this._enabled === true ? "fp-components-checkbox-checked" : "fp-components-checkbox-checked fp-components-checkbox-disabled";
                    } else {
                        this._root.className = this._enabled === true ? "fp-components-checkbox" : "fp-components-checkbox fp-components-checkbox-disabled"
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

            _paintCanvas(canvas, color) {
                let s = this._scale;
                canvas.height = s * 16;
                canvas.width = s * 16;
                let ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.moveTo(s * 1, s * 8);
                ctx.lineTo(s * 5, s * 13);
                ctx.lineTo(s * 15, s * 3);
                ctx.strokeStyle = color;
                ctx.lineCap = "round";
                ctx.lineWidth = s * 1.5;
                ctx.stroke();
            }

            rebuild() {

                let divButton = document.createElement("div");
                let canvas1 = document.createElement("canvas");
                let canvas2 = document.createElement("canvas");

                this._paintCanvas(canvas1, "white");
                this._paintCanvas(canvas2, "rgb(153,153,153)");

                divButton.appendChild(canvas1);
                divButton.appendChild(canvas2);

                if (this._desc) {
                    this._createDesc(divButton);
                }

                divButton.onclick = () => {

                    if (this._enabled == true) {
                        this._checked = this._checked == true ? false : true;
                        this._updateClassNames();
                        if (this._onclick !== null) {
                            this._onclick(this._checked);
                        }
                    }

                };

                this._root = divButton;
                this._updateClassNames();

                if (this._scale !== 1.0) {
                    this.scale = this._scale;
                }

                this._anchor.appendChild(divButton);

            }

            set scale(s) {
                this._scale = s;
                if (this._root !== null) {

                    this._root.style.borderWidth = (2 * s).toString() + "px";
                    this._root.style.width = (16 * s).toString() + "px";
                    this._root.style.height = (16 * s).toString() + "px";

                    let canvases = this._root.getElementsByTagName("canvas");
                    this._paintCanvas(canvases[0], "white");
                    this._paintCanvas(canvases[1], "rgb(153,153,153)");

                }
            }

            get scale() {
                return this._scale;
            }
        }

        o.Checkbox_A.VERSION = "1.1";
    }

})(FPComponents); 
