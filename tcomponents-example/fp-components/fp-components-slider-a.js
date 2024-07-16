
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-slider-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Slider_A")) {
        o.Slider_A = class {
            constructor() {
                this._pointerdown = this._pointerdown.bind(this);
                this._pointermove = this._pointermove.bind(this);
                this._pointerup = this._pointerup.bind(this);
                this._horizontalPadding = 28;
                this._textPadding = 16;
                this._anchor = null;
                this._root = null;
                this._labelElement = null;
                this._valueElement = null;
                this._activeTrackElement = null;
                this._inactiveTrackElement = null;
                this._touchBoxElement = null;
                this._trackHandleElement = null;
                this._ticks = [];
                this._label = "";
                this._displayLabel = true;
                this._displayValue = true;
                this._unit = "";
                this._enabled = true;
                this._min = 0;
                this._max = 100;
                this._tickStep = 1;
                this._internalTickStep = this._tickStep;
                this._displayTicks = false;
                this._value = 0;
                this._width = 172;
                this._numberOfDecimals = 0;
                this._ondrag = null;
                this._onrelease = null;
                this._lastNotifiedValue = 0;
                this._startX = 0;
                this._startOffset = 0;
                this._xPosition = 0;
                this._rawXPosition = 0;
                this._pixelValue = 100 / this._width;
                this._active = false;
            }
            get parent() {
                return this._anchor;
            }
            get min() {
                return this._min;
            }
            set min(v) {
                if (isNaN(v)) {
                    return;
                }
                this._min = v;
                if (this._anchor) {
                    this._rebuild();
                }
            }
            get max() {
                return this._max;
            }
            set max(v) {
                if (isNaN(v)) {
                    return;
                }
                this._max = v;
                if (this._anchor) {
                    this._rebuild();
                }
            }
            get value() {
                return Number.parseFloat(this._value);
            }
            set value(v) {
                if (isNaN(v)) {
                    return;
                }
                this._value = v;
                if (this._anchor) {
                    this._rebuild();
                }
            }
            get label() {
                return this._label;
            }
            set label(v) {
                this._label = v;
                if (this._anchor) {
                    this._updateLabel();
                }
            }
            get displayLabel() {
                return this._displayLabel;
            }
            set displayLabel(v) {
                this._displayLabel = v;
                if (this._anchor) {
                    this._updateLabel();
                }
            }
            get displayValue() {
                return this._displayValue;
            }
            set displayValue(v) {
                this._displayValue = v;
                if (this._anchor) {
                    this._updateLabel();
                }
            }
            get unit() {
                return this._unit;
            }
            set unit(v) {
                this._unit = v;
                if (this._anchor) {
                    this._updateLabel();
                }
            }
            get tickStep() {
                return this._tickStep;
            }
            set tickStep(v) {
                if (isNaN(v)) {
                    return;
                }
                if (v === 0) {
                    return;
                }
                this._tickStep = v;
                if (this._anchor) {
                    this._rebuild();
                }
            }
            get displayTicks() {
                return this._displayTicks;
            }
            set displayTicks(v) {
                this._displayTicks = v;
                if (this._anchor) {
                    this._rebuild();
                }
            }
            get numberOfDecimals() {
                return this._numberOfDecimals;
            }
            set numberOfDecimals(v) {
                this._numberOfDecimals = v;
                if (this._anchor) {
                    if (this._valueElement) {
                        this._valueWidth = this._getTextWidth(this._max.toFixed(this._numberOfDecimals), "14px Segoe UI") + this._textPadding;
                        this._valueElement.style.width = this._valueWidth + "px";
                        this._updateDynamicElements();
                    }
                }
            }
            get width() {
                return this._width + 28;
            }
            set width(v) {
                if (isNaN(v) || v === null || v === undefined) {
                    return;
                }
                this._width = v - 28;
                if (this._width < 1) {
                    this._width = 1;
                }
                if (this._anchor) {
                    this._rebuild();
                }
            }
            get enabled() {
                return this._enabled;
            }
            set enabled(e) {
                this._enabled = e ? true : false;
                this._updateClassNames();
            }
            get ondrag() {
                return this._ondrag;
            }
            set ondrag(f) {
                this._ondrag = f;
            }
            get onrelease() {
                return this._onrelease;
            }
            set onrelease(f) {
                this._onrelease = f;
            }
            _updateClassNames() {
                if (this._root !== null) {
                    if (!this._enabled) {
                        this._trackHandleElement.className = "fp-components-slider__track-handle fp-components-slider__track-handle--disabled";
                        this._activeTrackElement.className = "fp-components-slider__track fp-components-slider__track-disabled";
                    } else {
                        this._trackHandleElement.className = "fp-components-slider__track-handle fp-components-slider__track-handle--enabled";
                        this._activeTrackElement.className = "fp-components-slider__track fp-components-slider__track--active";
                    }
                }
                this._updateTickMarks();
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
                return this._rebuild();
            }
            _rebuild() {
                this._anchor.innerHTML = "";
                this._valueWidth = this._getTextWidth(this._max.toFixed(this._numberOfDecimals), "14px Segoe UI") + this._textPadding;
                this._pixelValue = (this._max - this._min) / this._width;
                this._xPosition = this._limitPosition((this._value - this._min) / this._pixelValue);
                let component = document.createElement("div");
                component.className = "fp-components-base fp-components-slider";
                component.style = "width: " + this._width + "px";
                this._createLabelPart(component);
                this._createRangePart(component);
                this._createMinMaxPart(component);
                this._root = component;
                this._anchor.appendChild(component);
                this._updateClassNames();
                this._rawXPosition = this._xPosition;
                this._updateDynamicElements();
            }
            _createLabelPart(component) {
                let divLabelContainer = document.createElement("div");
                divLabelContainer.className = "fp-components-slider__labels-wrapper";
                let label = document.createElement("span");
                label.textContent = this._buildLabel();
                label.className = this._displayLabel ? "fp-components-slider__label" : "fp-components-slider__label--hidden";
                this._labelElement = label;
                divLabelContainer.appendChild(label);
                let divValue = document.createElement("span");
                divValue.className = "fp-components-slider__value--hidden";
                divValue.style.left = this._xPosition + "px";
                divValue.style.width = this._valueWidth + "px";
                divValue.textContent = this._value;
                divLabelContainer.appendChild(divValue);
                this._valueElement = divValue;
                component.appendChild(divLabelContainer);
            }
            _createRangePart(component) {
                let divTrack = document.createElement("div");
                divTrack.className = "fp-components-slider__range-wrapper";
                divTrack.style.width = this._width + "px";
                divTrack.addEventListener("pointerdown", this._pointerdown);
                let divActiveTrack = document.createElement("div");
                divActiveTrack.className = "fp-components-slider__track ";
                divActiveTrack.className += this._enabled ? "fp-components-slider__track--active" : "fp-components-slider__track--disabled";
                divActiveTrack.style.width = (this._value - this._min) / this._pixelValue + "px";
                this._activeTrackElement = divActiveTrack;
                divTrack.appendChild(divActiveTrack);
                let divInavtiveTrack = document.createElement("div");
                divInavtiveTrack.className = "fp-components-slider__track";
                divInavtiveTrack.style.marginLeft = (this._value - this._min) / this._pixelValue + "px";
                divInavtiveTrack.style.width = (this._max - this._value) / this._pixelValue + "px";
                this._inactiveTrackElement = divInavtiveTrack;
                divTrack.appendChild(divInavtiveTrack);
                this._internalTickStep = this._tickStep;
                let rangeLength = this._max - this._min;
                let numOfSteps = rangeLength / this._internalTickStep;
                let stepPixelWidth = this._width / numOfSteps;
                const minVisiblePixelWidth = 5;
                if (stepPixelWidth < minVisiblePixelWidth) {
                    let newTickStep = this._internalTickStep;
                    let stepFactor = 0;
                    while (stepPixelWidth < minVisiblePixelWidth) {
                        stepFactor += 1;
                        newTickStep = this._internalTickStep * stepFactor;
                        numOfSteps = rangeLength / newTickStep;
                        stepPixelWidth = this._width / numOfSteps;
                    }
                    this._internalTickStep = newTickStep;
                }
                if (this.displayTicks) {
                    divTrack.style.backgroundSize = stepPixelWidth.toString() + "px 1px";
                } else {
                    divTrack.style.backgroundSize = "0px 1px";
                }
                function createTickMark(pixelPosition) {
                    let tickMark = document.createElement("div");
                    tickMark.style.left = pixelPosition + "px";
                    return tickMark;
                }
                this._ticks = [];
                if (this._displayTicks) {
                    let tickMarkStart = createTickMark(0);
                    this._ticks.push(tickMarkStart);
                    divTrack.appendChild(tickMarkStart);
                    let tickMarkEnd = createTickMark(this._width);
                    this._ticks.push(tickMarkEnd);
                    divTrack.appendChild(tickMarkEnd);
                }
                let divTouchbox = document.createElement("div");
                divTouchbox.className = "fp-components-slider__track-touchbox";
                divTouchbox.addEventListener("pointerdown", this._pointerdown);
                divTouchbox.style.left = this._xPosition + "px";
                this._touchBoxElement = divTouchbox;
                divTouchbox.addEventListener("pointerover", e => {
                    if (!this._active) {
                        this._valueElement.className = "fp-components-slider__value";
                        this._valueElement.className += " fp-components-slider__value--hover";
                        this._rawXPosition = this._xPosition;
                        this._updateDynamicElements();
                    }
                });
                divTouchbox.addEventListener("pointerout", e => {
                    if (!this._active) {
                        this._valueElement.className = "fp-components-slider__value";
                        this._valueElement.className += " fp-components-slider__value--hidden";
                    }
                });
                divTrack.appendChild(divTouchbox);
                let divTrackHandle = document.createElement("div");
                divTrackHandle.className = "fp-components-slider__track-handle";
                divTrackHandle.className += " fp-components-slider__track--handle-enabled";
                this._trackHandleElement = divTrackHandle;
                divTouchbox.appendChild(divTrackHandle);
                component.appendChild(divTrack);
            }
            _createMinMaxPart(component) {
                let divMinMax = document.createElement("div");
                divMinMax.className = "fp-components-slider__minmax-wrapper";
                let divMinValue = document.createElement("span");
                divMinValue.innerHTML = this._min;
                divMinValue.className = "fp-components-slider__minmax-label";
                divMinValue.className += " fp-components-slider__minmax-label--left";
                divMinMax.appendChild(divMinValue);
                let divSpacer = document.createElement("div");
                divSpacer.className = "fp-components-slider__minmax-spacer";
                divMinMax.appendChild(divSpacer);
                let divMaxValue = document.createElement("span");
                divMaxValue.innerHTML = this._max;
                divMaxValue.className = "fp-components-slider__minmax-label";
                divMaxValue.className += " fp-components-slider__minmax-label--right";
                divMinMax.appendChild(divMaxValue);
                component.appendChild(divMinMax);
            }
            _updateDynamicElements() {
                let rawValue = this._min + this._xPosition * this._pixelValue;
                this._value = rawValue.toFixed(this._numberOfDecimals);
                this._labelElement.textContent = this._buildLabel();
                this._touchBoxElement.style.left = this._xPosition + "px";
                this._valueElement.innerHTML = this._value;
                let maxPos = this._width - this._valueWidth / 2;
                let minPos = this._valueWidth / 2;
                if (this._rawXPosition >= maxPos) {
                    this._valueElement.style.left = maxPos + "px";
                } else if (this._rawXPosition <= minPos) {
                    this._valueElement.style.left = minPos + "px";
                } else {
                    this._valueElement.style.left = this._rawXPosition + "px";
                }
                this._activeTrackElement.style.width = (rawValue - this._min) / this._pixelValue + "px";
                this._inactiveTrackElement.style.marginLeft = (rawValue - this._min) / this._pixelValue + "px";
                this._inactiveTrackElement.style.width = (this._max - rawValue) / this._pixelValue + "px";
                this._updateTickMarks();
            }
            _updateTickMarks() {
                this._ticks.forEach((item, index, array) => {
                    let val = parseInt(item.style.left);
                    if (val <= this._xPosition) {
                        item.className = "fp-components-slider__tick";
                        if (this._enabled) {
                            item.className += " fp-components-slider__tick--selected";
                        } else {
                            item.className += " fp-components-slider__tick--disabled";
                        }
                    } else {
                        item.className = "fp-components-slider__tick";
                    }
                });
            }
            _limitPosition(position) {
                if (position < 0) {
                    position = 0;
                }
                if (position > this._width) {
                    position = this._width;
                }
                let value = position * this._pixelValue;
                let low = value - value % this._tickStep;
                let high = low + this._tickStep;
                let distanceToLowerValue = value - low;
                let distanceToHigherValue = high - value;
                let valueToSet = distanceToLowerValue < distanceToHigherValue ? low : high;
                if (valueToSet === low && high > this._max && value <= this._max && value > low) {
                    valueToSet = this._max;
                }
                return valueToSet / this._pixelValue;
            }
            _getTextWidth(text, font) {
                let canvas = document.createElement("canvas");
                let context = canvas.getContext("2d");
                context.font = font;
                let metrics = context.measureText(text);
                return metrics.width;
            }
            _buildLabel() {
                if (!this._displayLabel) {
                    return;
                }
                let label = this._label;
                if (this._displayValue) {
                    label += " " + this._value;
                    if (this._unit) {
                        label += this._unit;
                    }
                }
                return label;
            }
            _updateLabel() {
                if (this._labelElement) {
                    this._labelElement.className = this._displayLabel ? "fp-components-slider__label" : "fp-components-slider__label--hidden";
                    this._labelElement.innerHTML = this._buildLabel();
                }
            }
            _pointerdown(e) {
                if (!this._enabled) {
                    return;
                }
                this._active = true;
                this._startX = e.pageX;
                if (e.target.classList.contains("fp-components-slider__track-touchbox")) {
                    this._startOffset = this._xPosition;
                } else {
                    this._startOffset = e.offsetX;
                    this._rawXPosition = this._startOffset;
                    this._xPosition = this._limitPosition(this._startOffset);
                    if (this._xPosition < 0) {
                        this._xPosition = 0;
                    }
                    if (this._xPosition > this._width) {
                        this._xPosition = this._width;
                    }
                    this._updateDynamicElements();
                    if (this._ondrag) {
                        this._ondrag(Number.parseFloat(this._value));
                    }
                }
                this._valueElement.className = "fp-components-slider__value";
                this._valueElement.className += " fp-components-slider__value--active";
                this._trackHandleElement.className = "fp-components-slider__track-handle";
                this._trackHandleElement.className += " fp-components-slider__track-handle--enabled";
                this._trackHandleElement.className += " fp-components-slider__track-handle--active";
                document.addEventListener("pointermove", this._pointermove);
                document.addEventListener("pointerup", this._pointerup);
            }
            _pointermove(e) {
                e.preventDefault();
                let dx = e.pageX - this._startX;
                this._rawXPosition = this._startOffset + dx;
                this._xPosition = this._limitPosition(this._startOffset + dx);
                if (this._xPosition < 0) {
                    this._xPosition = 0;
                }
                if (this._xPosition > this._width) {
                    this._xPosition = this._width;
                }
                this._updateDynamicElements();
                if (this._ondrag) {
                    if (this._lastNotifiedValue != this._value) {
                        this._ondrag(Number.parseFloat(this._value));
                        this._lastNotifiedValue = this._value;
                    }
                }
            }
            _pointerup(e) {
                this._active = false;
                document.removeEventListener("pointermove", this._pointermove);
                document.removeEventListener("pointerup", this._pointerup);
                this._labelElement.innerHTML = this._buildLabel();
                this._valueElement.className = "fp-components-slider__value--hidden";
                this._trackHandleElement.className = "fp-components-slider__track-handle";
                this._trackHandleElement.className += " fp-components-slider__track-handle--enabled";
                if (this._onrelease) {
                    this._onrelease(Number.parseFloat(this._value));
                }
            }
        };
        o.Slider_A.VERSION = "1.4.1";
    }
})(FPComponents);