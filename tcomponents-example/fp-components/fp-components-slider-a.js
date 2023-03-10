
// (c) Copyright 2020-2023 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.2

'use strict';

fpComponentsLoadCSS("fp-components/fp-components-slider-a.css");

var FPComponents = FPComponents || {};
(function (o) {

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
                this._displayTicks = false;
                this._value = 0;
                this._width = 200;
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

            get min(){
                return this._min;
            }

            set min(v){
                this._min = v;

                if(this._anchor){
                    this._rebuild();
                }
            }

            get max(){
                return this._max;
            }

            set max(v){
                this._max = v;

                if(this._anchor){
                    this._rebuild();
                }
            }

            get value(){
                return Number.parseFloat(this._value);
            }

            set value(v){
                this._value = v;

                if(this._anchor){
                    this._rebuild();
                }
            }

            get label(){
                return this._label;
            }

            set label(v){
                this._label = v;

                if(this._anchor){
                    this._updateLabel();
                }
            }

            get displayLabel(){
                return this._displayLabel;
            }

            set displayLabel(v){
                this._displayLabel = v;

                if(this._anchor){
                    this._updateLabel();
                }
            }

            get displayValue(){
                return this._displayValue;
            }

            set displayValue(v){
                this._displayValue = v;

                if(this._anchor){
                    this._updateLabel();
                }
            }

            get unit(){
                return this._unit;
            }

            set unit(v){
                this._unit = v;

                if(this._anchor){
                    this._updateLabel();
                }
            }

            get tickStep(){
                return this._tickStep;
            }

            set tickStep(v){
                this._tickStep = v;

                if(this._anchor){
                    this._rebuild();
                }
            }

            get displayTicks(){
                return this._displayTicks;
            }

            set displayTicks(v){
                this._displayTicks = v;

                if(this._anchor){
                    this._rebuild();
                }
            }

            get numberOfDecimals(){
                return this._numberOfDecimals;
            }

            set numberOfDecimals(v){
                this._numberOfDecimals = v;

                if(this._anchor){
                    if(this._valueElement){
                    this._valueWidth = this._getTextWidth(this._max.toFixed(this._numberOfDecimals), "14px Segoe UI") + this._textPadding;
                    this._valueElement.style.width = this._valueWidth + "px";
                    this._updateDynamicElements();
                    }
                }
            }

            get width(){
                return this._width;
            }

            set width(v){
                this._width = v;

                if(this._anchor){
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

                    if(!this._enabled){
                        this._trackHandleElement.className = "fp-components-slider__track-handle fp-components-slider__track-handle--disabled";
                        this._activeTrackElement.className = "fp-components-slider__track fp-components-slider__track-disabled";
                        
                    }
                    else{
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
  
                this._anchor.innerHTML = '';
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

            _createLabelPart(component){
              
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

            _createRangePart(component){
                
                let divTrack = document.createElement("div");
                divTrack.className = "fp-components-slider__range-wrapper";
                divTrack.style.width = this._width + "px";
                divTrack.addEventListener("pointerdown", this._pointerdown);
                
                let divActiveTrack = document.createElement("div");
                divActiveTrack.className = "fp-components-slider__track ";
                divActiveTrack.className += this._enabled ? "fp-components-slider__track--active" : "fp-components-slider__track--disabled";
                divActiveTrack.style.width = ((this._value - this._min) / this._pixelValue) + 1 + "px";
                this._activeTrackElement = divActiveTrack;
                divTrack.appendChild(divActiveTrack);

                let divInavtiveTrack = document.createElement("div");
                divInavtiveTrack.className = "fp-components-slider__track";
                divInavtiveTrack.style.marginLeft = ((this._value - this._min) / this._pixelValue) + 1 + "px";
                divInavtiveTrack.style.width = ((this._max - this._value) / this._pixelValue) + "px";
                this._inactiveTrackElement = divInavtiveTrack;
                divTrack.appendChild(divInavtiveTrack);

                if(this._displayTicks && this._tickStep != 0){
                    for(var x = 0; x <= (this._width + 1); x = x + this._tickStep / this._pixelValue){
                        let mark = document.createElement("div");
                        
                        mark.style.left = x + "px";
                        this._ticks.push(mark);
                        divTrack.appendChild(mark);
                    }
                }

                let divTouchbox = document.createElement("div");
                divTouchbox.className = "fp-components-slider__track-touchbox";
                divTouchbox.addEventListener("pointerdown", this._pointerdown);
                divTouchbox.style.left =  this._xPosition + "px";
                this._touchBoxElement = divTouchbox;

                divTouchbox.addEventListener("pointerover", (e) => {
                    if(!this._active){
                        this._valueElement.className = "fp-components-slider__value";
                        this._valueElement.className += " fp-components-slider__value--hover";
                        this._rawXPosition = this._xPosition;
                        this._updateDynamicElements();
                    }
                });

                divTouchbox.addEventListener("pointerout", (e) => {
                    if(!this._active){
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

            _createMinMaxPart(component){
                let divMinMax = document.createElement("div");
                divMinMax.className = "fp-components-slider__minmax-wrapper";

                let divMinValue = document.createElement("span");
                divMinValue.innerHTML = this._min;
                divMinValue.className = "fp-components-slider__minmax-label";
                divMinValue.className += " fp-components-slider__minmax-label--left";
                divMinMax.appendChild(divMinValue);

                let divSpacer = document.createElement("div");
                divSpacer.className = "fp-components-slider__minmax-spacer";
                divMinMax.appendChild(divSpacer)

                let divMaxValue = document.createElement("span");
                divMaxValue.innerHTML = this._max;
                divMaxValue.className = "fp-components-slider__minmax-label";
                divMaxValue.className += " fp-components-slider__minmax-label--right";
                divMinMax.appendChild(divMaxValue);

                component.appendChild(divMinMax);
            }

            _updateDynamicElements(){

                var rawValue = this._min + (this._xPosition) * this._pixelValue;
                this._value = rawValue.toFixed(this._numberOfDecimals);
                this._labelElement.textContent = this._buildLabel();
                this._touchBoxElement.style.left = this._xPosition + "px";
                
                this._valueElement.innerHTML = this._value;
                var maxPos = this._width - this._valueWidth / 2;
                var minPos = this._valueWidth / 2;
               
                if(this._rawXPosition >= maxPos){
                    this._valueElement.style.left = maxPos + "px";
                }
                else if(this._rawXPosition <= minPos){
                    this._valueElement.style.left = minPos + "px";
                }
                else{
                    this._valueElement.style.left = (this._rawXPosition) + "px";
                }
               
                this._activeTrackElement.style.width = ((rawValue - this._min) / this._pixelValue) + 1 + "px";
                this._inactiveTrackElement.style.marginLeft =  ((rawValue - this._min) / this._pixelValue) + 1 + "px";
                this._inactiveTrackElement.style.width = ((this._max - rawValue) / this._pixelValue) + "px";

                this._updateTickMarks();
            }

            _updateTickMarks(){
                this._ticks.forEach((item, index, array) => {
                    
                    var val = parseInt(item.style.left);
                    
                    if(val <= this._xPosition){
                        item.className = "fp-components-slider__tick";
                        
                        if(this._enabled){
                            item.className +=  " fp-components-slider__tick--selected";
                        }
                        else{
                            item.className += " fp-components-slider__tick--disabled";
                        }
                    }
                    else{
                        item.className = "fp-components-slider__tick";
                    }
                  });
            }

            _limitPosition(position){
                
                if(position < 0){
                    position = 0;
                }

                if(position > this._width){
                    position = this._width;
                }

                var value = position * this._pixelValue;
                var low = value - value % this._tickStep;
                var high = low + this._tickStep;
                var result = (value - low) < (high - value) ? low : high;
                
                return (result / this._pixelValue);
            }

            _getTextWidth(text, font) {
             
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                context.font = font;
                var metrics = context.measureText(text);
            
                return metrics.width;
            }

            _buildLabel(){
                if(!this._displayLabel){
                    return;
                }

                var label = this._label;
                if(this._displayValue){
                    label += " " + this._value;

                    if(this._unit){
                        label += this._unit;
                    }
                }

                return label;
            }

            _updateLabel(){

                if(this._labelElement){
                    this._labelElement.className = this._displayLabel ? "fp-components-slider__label" : "fp-components-slider__label--hidden";
                    this._labelElement.innerHTML = this._buildLabel();
                }
            }

            // Function rebound in constructor to use class object as this.
            _pointerdown(e){

                if(!this._enabled){
                    return;
                }

                this._active = true;
                this._startX = e.pageX;

                if(e.target.classList.contains("fp-components-slider__track-touchbox"))
                {
                    this._startOffset = this._xPosition;
                }
                else
                {
                    this._startOffset = e.offsetX;
                    this._rawXPosition = this._startOffset;
                    this._xPosition = this._limitPosition(this._startOffset); 
                    this._updateDynamicElements();

                    if(this._ondrag){
                        this._ondrag(this._value);
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

             // Function rebound in constructor to use class object as this.
            _pointermove(e){

                e.preventDefault();
                var dx = e.pageX - this._startX;
                this._rawXPosition = this._startOffset + dx;
                this._xPosition = this._limitPosition(this._startOffset + dx); 
                this._updateDynamicElements();

                if(this._ondrag){
                    if(this._lastNotifiedValue != this._value){
                    this._ondrag(this._value);
                        this._lastNotifiedValue = this._value;
                    }
                }
            }

             // Function rebound in constructor to use class object as this.
            _pointerup(e){

                this._active = false;
                document.removeEventListener("pointermove", this._pointermove);
                document.removeEventListener("pointerup", this._pointerup);
                this._labelElement.innerHTML = this._buildLabel();
                this._valueElement.className = "fp-components-slider__value--hidden";
                this._trackHandleElement.className = "fp-components-slider__track-handle";
                this._trackHandleElement.className += " fp-components-slider__track-handle--enabled";

                if(this._onrelease){
                    this._onrelease(this._value);
                }
            }
        }

        o.Slider_A.VERSION = "1.2";
    }

})(FPComponents); 
