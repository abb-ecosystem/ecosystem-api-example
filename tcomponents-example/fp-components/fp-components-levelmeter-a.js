
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Levelmeter_A")) {
        o.Levelmeter_A = class {
            constructor() {
                this._anchor = null;
                this._root = null;
                this._canvas = null;
                this._width = null;
                this._max = null;
                this._min = null;
                this._value = null;
                this._lim1 = null;
                this._lim2 = null;
                this._unit = null;
                this._dirty = false;
            }
            get parent() {
                return this._anchor;
            }
            get width() {
                return this._width;
            }
            set width(w) {
                this._width = w;
                this.repaintLater();
            }
            get max() {
                return this._max;
            }
            set max(m) {
                this._max = m;
                this.repaintLater();
            }
            get min() {
                return this._min;
            }
            set min(m) {
                this._min = m;
                this.repaintLater();
            }
            get value() {
                return this._value;
            }
            set value(v) {
                this._value = v;
                this.repaintLater();
            }
            get lim1() {
                return this._lim1;
            }
            set lim1(lim) {
                this._lim1 = lim;
                this.repaintLater();
            }
            get lim2() {
                return this._lim2;
            }
            set lim2(lim) {
                this._lim2 = lim;
                this.repaintLater();
            }
            get unit() {
                return this._unit;
            }
            set unit(u) {
                this._unit = u;
                this.repaintLater();
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
            repaintLater() {
                this._dirty = true;
                setTimeout(() => {
                    this.paint();
                }, 0);
            }
            paint() {
                if (this._dirty === false) {
                    return;
                }
                this._dirty = false;
                let canvas = this._canvas;
                if (canvas === null) {
                    return;
                }
                let canvasWidthPix = typeof this._width === "number" ? this._width : 200;
                let maxVal = typeof this._max === "number" ? this._max : 100;
                let minVal = typeof this._min === "number" ? this._min : 0;
                let curVal = typeof this._value === "number" ? this._value : 0;
                let lim1Val = typeof this._lim1 === "number" ? this._lim1 : 100;
                let lim2Val = typeof this._lim2 === "number" ? this._lim2 : 100;
                let unit = this._unit !== null ? this._unit.toString() : "";
                let paddingLeftPix = 5;
                let paddingRightPix = paddingLeftPix;
                let paddingTopPix = 18;
                let paddingBottomPix = 18;
                let barWidthPix = canvasWidthPix - paddingLeftPix - paddingRightPix;
                let barHeightPix = 8;
                let fixedLabelsFontSize = 12;
                let curLabelFontSize = 14;
                let markerWidthPix = 2;
                let markerStickoutPix = 3;
                let fixedMarkerWidthPix = 2;
                let fixedMarkerStickoutPix = 3;
                let minText = `${minVal}${unit}`;
                let maxText = `${maxVal}${unit}`;
                let curText = `${curVal}${unit}`;
                function valToBarPix(val) {
                    return (val - minVal) * (barWidthPix / (maxVal - minVal));
                }
                canvas.width = canvasWidthPix;
                canvas.height = barHeightPix + paddingTopPix + paddingBottomPix;
                let ctx = canvas.getContext("2d");
                ctx.save();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
                ctx.save();
                ctx.translate(paddingLeftPix, paddingTopPix);
                ctx.fillStyle = "#0CA919";
                ctx.fillRect(0, 0, barWidthPix, barHeightPix);
                if (lim1Val !== null) {
                    ctx.fillStyle = "#FFD800";
                    ctx.fillRect(valToBarPix(lim1Val), 0, barWidthPix - valToBarPix(lim1Val), barHeightPix);
                }
                if (lim2Val !== null) {
                    ctx.fillStyle = "#F03040";
                    ctx.fillRect(valToBarPix(lim2Val), 0, barWidthPix - valToBarPix(lim2Val), barHeightPix);
                }
                ctx.fillStyle = "#696969";
                ctx.font = `${fixedLabelsFontSize}px Segoe UI`;
                ctx.fillText(minText, 0, barHeightPix + fixedLabelsFontSize + markerStickoutPix);
                ctx.fillText(maxText, barWidthPix - ctx.measureText(maxText).width, barHeightPix + fixedLabelsFontSize + markerStickoutPix);
                ctx.strokeStyle = "#696969";
                ctx.lineWidth = fixedMarkerWidthPix;
                ctx.beginPath();
                ctx.moveTo(0, -fixedMarkerStickoutPix);
                ctx.lineTo(0, barHeightPix + fixedMarkerStickoutPix);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(barWidthPix, -fixedMarkerStickoutPix);
                ctx.lineTo(barWidthPix, barHeightPix + fixedMarkerStickoutPix);
                ctx.stroke();
                ctx.strokeStyle = "black";
                ctx.lineWidth = markerWidthPix;
                ctx.beginPath();
                ctx.moveTo(valToBarPix(curVal), -markerStickoutPix);
                ctx.lineTo(valToBarPix(curVal), barHeightPix + markerStickoutPix);
                ctx.stroke();
                ctx.fillStyle = "black";
                ctx.font = `${curLabelFontSize}px Segoe UI Semibold`;
                let curLabelWidthPix = ctx.measureText(curText).width;
                let curLabelPosPix = valToBarPix(curVal);
                let curLabelOffsetPix = curLabelWidthPix / 2;
                if (curLabelPosPix + curLabelOffsetPix > barWidthPix) {
                    ctx.fillText(curText, barWidthPix - curLabelWidthPix, -markerStickoutPix - 2);
                } else if (curLabelPosPix - curLabelOffsetPix < 0) {
                    ctx.fillText(curText, 0, -markerStickoutPix - 2);
                } else {
                    ctx.fillText(curText, curLabelPosPix - curLabelOffsetPix, -markerStickoutPix - 2);
                }
                ctx.restore();
            }
            rebuild() {
                if (this._anchor === null) {
                    return false;
                }
                let divWrapper = document.createElement("div");
                divWrapper.style.display = "flex";
                divWrapper.style.padding = "6px 0 6px 0";
                let canvas = document.createElement("canvas");
                divWrapper.appendChild(canvas);
                this._canvas = canvas;
                this._root = divWrapper;
                this._anchor.appendChild(divWrapper);
                this._dirty = true;
                this.paint();
            }
        };
        o.Levelmeter_A.VERSION = "1.4.1";
    }
})(FPComponents);