
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-popup-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Popup_A")) {
        o.Popup_A = class {
            constructor() {}
            static _createPopup() {
                let body = document.body;
                let bgDiv = document.createElement("div");
                bgDiv.className = "fp-components-popup-bg";
                let popupDiv = document.createElement("div");
                popupDiv.className = "fp-components-popup";
                let topBorderDiv = document.createElement("div");
                topBorderDiv.className = "fp-components-popup-top-border";
                let contentDiv = document.createElement("div");
                contentDiv.className = "fp-components-popup-content";
                let headerDiv = document.createElement("div");
                headerDiv.className = "fp-components-popup-header";
                let bodyContentDiv = document.createElement("div");
                bodyContentDiv.className = "fp-components-popup-body";
                let bottomDiv = document.createElement("div");
                bottomDiv.className = "fp-components-popup-footer";
                let iconDiv = document.createElement("div");
                iconDiv.className = "fp-components-popup-icon";
                iconDiv.style.display = "none";
                let messageDiv = document.createElement("div");
                messageDiv.className = "fp-components-popup-message";
                this._iconDiv = iconDiv;
                this._bgDiv = bgDiv;
                this._popupDiv = popupDiv;
                this._bodyContentDiv = bodyContentDiv;
                this._footerDiv = bottomDiv;
                this._contentDiv = contentDiv;
                this._headerDiv = headerDiv;
                this._messageDiv = messageDiv;
                body.appendChild(bgDiv);
                bgDiv.appendChild(popupDiv);
                popupDiv.appendChild(topBorderDiv);
                popupDiv.appendChild(contentDiv);
                contentDiv.appendChild(headerDiv);
                contentDiv.appendChild(bodyContentDiv);
                bodyContentDiv.appendChild(iconDiv);
                bodyContentDiv.appendChild(messageDiv);
                contentDiv.appendChild(bottomDiv);
            }
            static _init() {
                if (!this.hasOwnProperty("_inited")) {
                    this._inited = true;
                    this._queue = [];
                    this._active = false;
                    this._callback = null;
                    this._createPopup();
                }
            }
            static message(header, message, callback = null, style = null) {
                this._init();
                let model = {
                    header: [ {
                        type: "text",
                        text: header
                    } ],
                    footer: [ {
                        type: "button",
                        highlight: true,
                        text: "OK",
                        action: FPComponents.Popup_A.OK
                    } ]
                };
                model.content = this._unpackMessage(message);
                if (this._active) {
                    this._queue.push([ model, callback, style ]);
                    return;
                }
                this._model = model;
                this._callback = callback;
                this._active = true;
                this._clearDivs();
                this._handleStyle(style);
                this._show(model);
            }
            static confirm(header, message, callback = null, style = null) {
                this._init();
                let model = {
                    header: [ {
                        type: "text",
                        text: header
                    } ],
                    footer: [ {
                        type: "button",
                        text: "Cancel",
                        action: FPComponents.Popup_A.CANCEL
                    }, {
                        type: "button",
                        highlight: true,
                        text: "OK",
                        action: FPComponents.Popup_A.OK
                    } ]
                };
                model.content = this._unpackMessage(message);
                if (this._active) {
                    this._queue.push([ model, callback, style ]);
                    return;
                }
                this._clearDivs();
                this._active = true;
                this._callback = callback;
                this._model = model;
                this._handleStyle(style);
                this._show(model);
            }
            static custom(model, callback = null) {
                this._init();
                if (this._active) {
                    this._queue.push([ model, callback, null ]);
                    return;
                }
                this._model = model;
                this._callback = callback;
                this._active = true;
                this._clearDivs();
                this._handleStyle(null);
                this._show(model);
            }
            static _parseModel(model, parent) {
                if (model !== undefined && Array.isArray(model)) {
                    for (let item of model) {
                        switch (item.type) {
                          case "button":
                            let divContainer = document.createElement("div");
                            var btn = new FPComponents.Button_A();
                            btn.text = item.text;
                            btn.highlight = item.highlight;
                            if (item.closeDialog === false) {
                                btn.onclick = () => {
                                    this._callback(item.action);
                                };
                            } else {
                                btn.onclick = () => {
                                    this.close(item.action);
                                };
                            }
                            btn.attachToElement(divContainer);
                            parent.appendChild(divContainer);
                            break;

                          case "text":
                            let textDiv = null;
                            if (typeof item.text !== "string") {
                                item.text = `${item.text}`;
                            }
                            if (item.text.trim() !== "" || item.text.includes("\n")) {
                                textDiv = document.createElement("div");
                                textDiv.textContent = item.text;
                                if (parent === this._headerDiv) {
                                    textDiv.className = "fp-components-popup-header-text";
                                } else if (parent === this._messageDiv) {
                                    textDiv.className = "fp-components-popup-message-text";
                                }
                            } else {
                                textDiv = document.createElement("br");
                            }
                            parent.appendChild(textDiv);
                            break;
                        }
                    }
                }
            }
            static close(action) {
                if (this._inited) {
                    if (this._bgDiv.parentNode !== null) {
                        this._bgDiv.parentNode.removeChild(this._bgDiv);
                    }
                    this._clearDivs();
                    if (this._active === true && typeof this._callback === "function") {
                        this._callback(action);
                    }
                    this._callback = null;
                    if (this._queue.length > 0) {
                        let popup = this._queue.shift();
                        var model = popup[0];
                        var callback = popup[1];
                        var style = popup[2];
                        this._active = true;
                        this._callback = callback;
                        this._handleStyle(style);
                        this._show(model);
                    } else {
                        this._active = false;
                    }
                }
            }
            static _clearDivs() {
                while (this._headerDiv.firstChild) {
                    this._headerDiv.removeChild(this._headerDiv.firstChild);
                }
                while (this._messageDiv.firstChild) {
                    this._messageDiv.removeChild(this._messageDiv.firstChild);
                }
                while (this._footerDiv.firstChild) {
                    this._footerDiv.removeChild(this._footerDiv.firstChild);
                }
            }
            static _show(model) {
                if (model) {
                    this._parseModel(model.header, this._headerDiv);
                    this._parseModel(model.content, this._messageDiv);
                    this._parseModel(model.footer, this._footerDiv);
                    document.body.appendChild(this._bgDiv);
                    return;
                }
            }
            static _unpackMessage(message) {
                var lineList = [];
                if (!Array.isArray(message)) {
                    message = [ message ];
                }
                for (const line of message) {
                    lineList.push({
                        type: "text",
                        text: line
                    });
                }
                return lineList;
            }
            static _handleStyle(style) {
                if (!style) {
                    this._iconDiv.style.display = "none";
                    return;
                }
                if (style == this.STYLE.INFORMATION) {
                    this._iconDiv.className = "fp-components-popup-icon";
                }
                if (style == this.STYLE.WARNING) {
                    this._iconDiv.className = "fp-components-popup-icon fp-components-popup-icon--warning";
                }
                if (style == this.STYLE.DANGER) {
                    this._iconDiv.className = "fp-components-popup-icon fp-components-popup-icon--danger";
                }
                this._iconDiv.style.display = "block";
            }
        };
        o.Popup_A.VERSION = "1.4.1";
        o.Popup_A.OK = "ok";
        o.Popup_A.CANCEL = "cancel";
        o.Popup_A.NONE = "none";
        o.Popup_A.STYLE = {
            INFORMATION: "information",
            WARNING: "warning",
            DANGER: "danger"
        };
    }
})(FPComponents);