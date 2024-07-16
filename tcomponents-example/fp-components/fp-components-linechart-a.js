
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Linechart_A")) {
        o.Linechart_A = class {
            constructor() {
                this._anchor = null;
                this._root = null;
                this._canvas = null;
                this._width = null;
                this._height = null;
                this._xMax = null;
                this._xMin = null;
                this._yMax = null;
                this._yMin = null;
                this._xStep = null;
                this._yStep = null;
                this._xLabels = null;
                this._yLabels = null;
                this._xAutoLabelStep = null;
                this._yAutoLabelStep = null;
                this._model = null;
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
            get height() {
                return this._height;
            }
            set height(h) {
                this._height = h;
                this.repaintLater();
            }
            get xMax() {
                return this._xMax;
            }
            set xMax(x) {
                this._xMax = x;
                this.repaintLater();
            }
            get xMin() {
                return this._xMin;
            }
            set xMin(x) {
                this._xMin = x;
                this.repaintLater();
            }
            get yMax() {
                return this._yMax;
            }
            set yMax(y) {
                this._yMax = y;
                this.repaintLater();
            }
            get yMin() {
                return this._yMin;
            }
            set yMin(y) {
                this._yMin = y;
                this.repaintLater();
            }
            get xStep() {
                return this._xStep;
            }
            set xStep(x) {
                this._xStep = x;
                this.repaintLater();
            }
            get yStep() {
                return this._yStep;
            }
            set yStep(y) {
                this._yStep = y;
                this.repaintLater();
            }
            get xLabels() {
                return this._xLabels;
            }
            set xLabels(x) {
                this._xLabels = x;
                this.repaintLater();
            }
            get yLabels() {
                return this._yLabels;
            }
            set yLabels(y) {
                this._yLabels = y;
                this.repaintLater();
            }
            get xAutoLabelStep() {
                return this._xAutoLabelStep;
            }
            set xAutoLabelStep(x) {
                this._xAutoLabelStep = x;
                this.repaintLater();
            }
            get yAutoLabelStep() {
                return this._yAutoLabelStep;
            }
            set yAutoLabelStep(y) {
                this._yAutoLabelStep = y;
                this.repaintLater();
            }
            get model() {
                return this._model;
            }
            set model(m) {
                this._model = m;
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
                let xMax = this._xMax;
                let xMin = this._xMin;
                let yMax = this._yMax;
                let yMin = this._yMin;
                let xStep = this._xStep;
                let yStep = this._yStep;
                let model = this._model;
                let canvas = this._canvas;
                if (canvas === null) {
                    return;
                }
                let ctx = canvas.getContext("2d");
                canvas.width = this._width === null ? 640 : this._width;
                canvas.height = this._height === null ? 480 : this._height;
                ctx.fillStyle = "black";
                ctx.font = "16px Segoe UI";
                ctx.save();
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
                if (!Array.isArray(model)) {
                    return;
                }
                let autoXMax = false;
                let autoXMin = false;
                let autoYMax = false;
                let autoYMin = false;
                if (typeof xMax !== "number") {
                    xMax = null;
                    autoXMax = true;
                }
                if (typeof xMin !== "number") {
                    xMin = null;
                    autoXMin = true;
                }
                if (typeof yMax !== "number") {
                    yMax = null;
                    autoYMax = true;
                }
                if (typeof yMin !== "number") {
                    yMin = null;
                    autoYMin = true;
                }
                if (autoXMax || autoXMin || autoYMax || autoYMin) {
                    for (let item of model) {
                        if (Array.isArray(item.points)) {
                            for (let p of item.points) {
                                var xValue = parseFloat(p[0]);
                                var yValue = parseFloat(p[1]);
                                if (isNaN(xValue) || isNaN(yValue)) {
                                    console.error(`Point ${p} was not a number!`);
                                }
                                if (autoXMax && (xMax === null || xValue > xMax)) xMax = xValue;
                                if (autoXMin && (xMin === null || xValue < xMin)) xMin = xValue;
                                if (autoYMax && (yMax === null || yValue > yMax)) yMax = yValue;
                                if (autoYMin && (yMin === null || yValue < yMin)) yMin = yValue;
                            }
                        }
                    }
                }
                if (xMax === null) xMax = 100;
                if (xMin === null) xMin = 0;
                if (yMax === null) yMax = 100;
                if (yMin === null) yMin = 0;
                function calcStep(max) {
                    let magnitudes = 0;
                    let max2 = max;
                    let ret;
                    if (max2 > 1) {
                        while (max2 > 1) {
                            max2 /= 10;
                            magnitudes++;
                        }
                        ret = Math.pow(10, magnitudes - 1);
                        if (max / ret < 5) {
                            ret /= 2;
                        }
                        return ret;
                    } else {
                        return max;
                    }
                }
                if (typeof xStep !== "number") {
                    xStep = calcStep(Math.max(Math.abs(xMin), Math.abs(xMax)));
                }
                if (typeof yStep !== "number") {
                    yStep = calcStep(Math.max(Math.abs(yMin), Math.abs(yMax)));
                }
                let yLabels = [];
                let yAutoLabelStep = this._yAutoLabelStep;
                if (yAutoLabelStep === null) {
                    yAutoLabelStep = yStep;
                } else if (typeof yAutoLabelStep !== "number") {
                    yAutoLabelStep = 0;
                }
                if (yAutoLabelStep > 0) {
                    yLabels.push([ yMin, yMin ]);
                    for (let i = yMin + yAutoLabelStep - yMin % yAutoLabelStep; i <= yMax; i += yAutoLabelStep) {
                        yLabels.push([ i, i ]);
                    }
                }
                if (Array.isArray(this._yLabels)) {
                    for (let l of this._yLabels) {
                        if (Array.isArray(l)) {
                            yLabels.push(l);
                        }
                    }
                }
                let yLabelAreaWidth = 0;
                for (let l of yLabels) {
                    let w = Math.ceil(ctx.measureText(l[0]).width);
                    l[2] = w;
                    if (w > yLabelAreaWidth) yLabelAreaWidth = w;
                }
                yLabelAreaWidth += 10;
                let xLabels = [];
                let xAutoLabelStep = this._xAutoLabelStep;
                if (xAutoLabelStep === null) {
                    xAutoLabelStep = xStep;
                } else if (typeof xAutoLabelStep !== "number") {
                    xAutoLabelStep = 0;
                }
                if (xAutoLabelStep > 0) {
                    xLabels.push([ xMin, xMin ]);
                    for (let i = xMin + xAutoLabelStep - xMin % xAutoLabelStep; i <= xMax; i += xAutoLabelStep) {
                        xLabels.push([ i, i ]);
                    }
                }
                if (Array.isArray(this._xLabels)) {
                    for (let l of this._xLabels) {
                        if (Array.isArray(l)) {
                            xLabels.push(l);
                        }
                    }
                }
                let xLabelAreaWidth = 0;
                for (let l of xLabels) {
                    let w = Math.ceil(ctx.measureText(l[0]).width);
                    l[2] = w;
                    if (w > xLabelAreaWidth) xLabelAreaWidth = w;
                }
                xLabelAreaWidth += 10;
                ctx.save();
                ctx.translate(yLabelAreaWidth, 8);
                drawChart(canvas.width - yLabelAreaWidth - 8 - 1, canvas.height - xLabelAreaWidth - 8 - 1);
                ctx.restore();
                function drawChart(wPix, hPix) {
                    ctx.save();
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, wPix, hPix);
                    ctx.restore();
                    ctx.save();
                    for (let l of yLabels) {
                        ctx.fillStyle = "white";
                        ctx.fillRect(-(l[2] + 7), hPix - yPix(l[1]) - 8, l[2], 17);
                        ctx.fillStyle = "black";
                        ctx.fillText(l[0], -(l[2] + 7), hPix - yPix(l[1]) + 6);
                    }
                    ctx.restore();
                    for (let l of xLabels) {
                        ctx.save();
                        ctx.translate(xPix(l[1]), hPix);
                        ctx.rotate(-Math.PI / 2);
                        ctx.translate(-l[2] - 7, 5);
                        ctx.fillStyle = "white";
                        ctx.fillRect(0, -16, l[2], 17);
                        ctx.fillStyle = "black";
                        ctx.fillText(l[0], 0, 0);
                        ctx.restore();
                    }
                    ctx.translate(.5, .5);
                    ctx.translate(0, hPix);
                    ctx.scale(1, -1);
                    ctx.beginPath();
                    ctx.rect(xPix(xMin), yPix(yMin), xPix(xMax), yPix(yMax));
                    ctx.clip();
                    ctx.save();
                    ctx.strokeStyle = "rgb(217,234,244)";
                    ctx.lineWidth = 1;
                    if (xStep > 0) {
                        for (let i = xMin - xMin % xStep; i < xMax; i += xStep) {
                            ctx.beginPath();
                            ctx.moveTo(xPix(i), yPix(yMin));
                            ctx.lineTo(xPix(i), yPix(yMax));
                            ctx.stroke();
                        }
                    }
                    if (yStep > 0) {
                        for (let i = yMin - yMin % yStep; i < yMax; i += yStep) {
                            ctx.beginPath();
                            ctx.moveTo(xPix(xMin), yPix(i));
                            ctx.lineTo(xPix(xMax), yPix(i));
                            ctx.stroke();
                        }
                    }
                    ctx.restore();
                    ctx.save();
                    for (let item of model) {
                        if (item.hidden === true) {
                            continue;
                        }
                        if (item.red === undefined || item.red === null || item.green === undefined || item.green === null || item.blue === undefined || item.blue === null) {
                            ctx.fillStyle = "rgba(17,125,187,0.063)";
                            ctx.strokeStyle = "rgba(17,125,187,1)";
                        } else {
                            ctx.fillStyle = `rgba(${item.red},${item.green},${item.blue},0.063)`;
                            ctx.strokeStyle = `rgba(${item.red},${item.green},${item.blue},1)`;
                        }
                        if (item.thickness === undefined || item.thickness === null) {
                            ctx.lineWidth = 1;
                        } else {
                            ctx.lineWidth = item.thickness;
                        }
                        ctx.lineJoin = "round";
                        if (item.points !== undefined) {
                            item.points.sort((a, b) => {
                                return a[0] > b[0];
                            });
                            if (!(item.fill === false)) {
                                let lastd = null;
                                for (let d of item.points) {
                                    if (lastd !== null) {
                                        ctx.beginPath();
                                        ctx.moveTo(xPix(lastd[0]), yPix(lastd[1]));
                                        ctx.lineTo(xPix(d[0]), yPix(d[1]));
                                        ctx.lineTo(xPix(d[0]), yPix(0));
                                        ctx.lineTo(xPix(lastd[0]), yPix(0));
                                        ctx.closePath();
                                        ctx.fill();
                                    }
                                    lastd = d;
                                }
                            }
                            ctx.beginPath();
                            ctx.moveTo(xPix(item.points[0][0]), yPix(item.points[0][1]));
                            for (let d of item.points) {
                                ctx.lineTo(xPix(d[0]), yPix(d[1]));
                            }
                            ctx.stroke();
                            if (item.dots !== false) {
                                ctx.save();
                                let lw = ctx.lineWidth;
                                ctx.lineWidth = 1;
                                ctx.fillStyle = ctx.strokeStyle;
                                for (let d of item.points) {
                                    ctx.beginPath();
                                    ctx.arc(xPix(d[0]), yPix(d[1]), lw / 2 + 3, 0, 2 * Math.PI, false);
                                    ctx.fill();
                                }
                                ctx.restore();
                            }
                        }
                        if (item.yMarker !== undefined) {
                            let yMarker = item.yMarker;
                            if (!Array.isArray(yMarker)) {
                                yMarker = [ yMarker ];
                            }
                            for (let ym of yMarker) {
                                ctx.save();
                                ctx.beginPath();
                                ctx.moveTo(xPix(xMin), yPix(ym));
                                ctx.lineTo(xPix(xMax), yPix(ym));
                                ctx.stroke();
                                ctx.restore();
                            }
                        }
                        if (item.xMarker !== undefined) {
                            let xMarker = item.xMarker;
                            if (!Array.isArray(xMarker)) {
                                xMarker = [ xMarker ];
                            }
                            for (let xm of xMarker) {
                                ctx.save();
                                ctx.beginPath();
                                ctx.moveTo(xPix(xm), yPix(yMin));
                                ctx.lineTo(xPix(xm), yPix(yMax));
                                ctx.stroke();
                                ctx.restore();
                            }
                        }
                        if (item.xFunc !== undefined) {
                            let xFunc = item.xFunc;
                            if (!Array.isArray(xFunc)) {
                                xFunc = [ xFunc ];
                            }
                            let xFuncStep = item.xFuncStep === undefined ? xStep : item.xFuncStep;
                            for (let xf of xFunc) {
                                if (typeof xf === "function") {
                                    ctx.save();
                                    ctx.beginPath();
                                    ctx.moveTo(xPix(xMin), yPix(xf(xMin)));
                                    for (let i = xMin + xFuncStep; i < xMax + xFuncStep; i += xFuncStep) {
                                        ctx.lineTo(xPix(i), yPix(xf(i)));
                                    }
                                    ctx.stroke();
                                    ctx.restore();
                                }
                            }
                        }
                        if (item.yFunc !== undefined) {
                            let yFunc = item.yFunc;
                            if (!Array.isArray(yFunc)) {
                                yFunc = [ yFunc ];
                            }
                            let yFuncStep = item.yFuncStep === undefined ? yStep : item.yFuncStep;
                            for (let yf of yFunc) {
                                if (typeof yf === "function") {
                                    ctx.save();
                                    ctx.beginPath();
                                    ctx.moveTo(xPix(yf(yMin)), yPix(yMin));
                                    for (let i = yMin + yFuncStep; i < yMax + yFuncStep; i += yFuncStep) {
                                        ctx.lineTo(xPix(yf(i)), yPix(i));
                                    }
                                    ctx.stroke();
                                    ctx.restore();
                                }
                            }
                        }
                    }
                    ctx.restore();
                    ctx.save();
                    ctx.strokeStyle = "rgb(17,125,187)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(wPix, 0);
                    ctx.lineTo(wPix, hPix);
                    ctx.lineTo(0, hPix);
                    ctx.lineTo(0, 0);
                    ctx.stroke();
                    ctx.restore();
                    function xPix(x) {
                        return Math.round((x - xMin) / (xMax - xMin) * wPix);
                    }
                    function yPix(y) {
                        return Math.round((y - yMin) / (yMax - yMin) * hPix);
                    }
                }
            }
            rebuild() {
                if (this._anchor === null) {
                    return false;
                }
                let divWrapper = document.createElement("div");
                divWrapper.style.display = "inline-flex";
                let canvas = document.createElement("canvas");
                divWrapper.appendChild(canvas);
                this._canvas = canvas;
                this._root = divWrapper;
                this._anchor.appendChild(divWrapper);
                this._dirty = true;
                this.paint();
            }
        };
        o.Linechart_A.VERSION = "1.4.1";
    }
})(FPComponents);