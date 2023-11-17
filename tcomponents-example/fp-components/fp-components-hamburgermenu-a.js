
// (c) Copyright 2020-2023 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.4

'use strict';

fpComponentsLoadCSS("fp-components/fp-components-hamburgermenu-a.css");

var FPComponents = FPComponents || {};
(function (o) {
    if (!o.hasOwnProperty("Hamburgermenu_A")) {
        o.Hamburgermenu_A = class {
            constructor() {
                this._root = null;
                this._buttonDiv = null;
                this._titleDiv = null;
                this._contentPane = null;
                this._menuWrapper = null;
                this._menuDiv = null;
                this._menuContainer = null;
                this._anchor = null;
                this._overlayDiv = null;
                this._isOpen = false;
                this._alwaysVisible = true;
                this._title = null;
                this._activeView = null;
                this._activeViewId = null;
                this._dirty = false;
                this._views = [];
                this._onchange = null;
            }

            get parent() {
                return this._anchor;
            }

            get title() {
                return this._title;
            }

            set title(t) {
                this._title = t;
                if (this._titleDiv) {
                    this._titleDiv.textContent = this._title;
                }
            }

            get onchange() {
                return this._onchange;
            }

            set onchange(o) {
                this._onchange = o;
            }

            get viewIdList() {
                let list = [];
                for (const v of this._views) {
                    list.push(v.id);
                }
                return list;
            }

            get activeView() {
                return this._activeViewId;
            }

            set activeView(id) {
                let view;
                for (let v of this._views) {
                    if (v.id === this._activeViewId) {
                        view = v;
                        break;
                    }
                }

                if (view) {
                    view.scrollTop = this._contentPane.scrollTop
                }

                if (this._onchange != null && typeof this._onchange === "function") {
                    let oldId = null;
                    if (view) {
                        oldId = view.id;
                    }

                    this._onchange(oldId, id);
                }

                this._activeViewId = id;
                this._updateViews();
            }

            get alwaysVisible() {
                return this._alwaysVisible;
            }

            set alwaysVisible(a) {
                this._alwaysVisible = a;
                if (!this._root) {
                    return;
                }

                this._updateMenu();
            }

            getViewButtonLabel(id) {
                for (const v of this._views) {
                    if (v.id === id) {
                        return v.label;
                    }
                }
                return null;
            }

            addView(label, contentElement, icon, active = false) {
                if (typeof contentElement === 'string') {
                    contentElement = document.getElementById(contentElement);
                }

                let id = {};

                let newView = { id, label, icon, contentElement, active };
                this._views.push(newView);

                this._updateViews(newView);

                return id;
            }

            removeView(id) {

                const view = this._views.find(v => v.id === id);

                if(view) {
                    let i = this._views.indexOf(view);

                    if(i >= 0) {
                        this._views.splice(i, 1);
                    }
                }

                this._updateViews({ id, delete: true });
            }

            setViewButtonLabel(id, newText) {
                const view = this._views.find(v => v.id === id);                
                if(view) {
                    const textNode = view.menuButton.getElementsByTagName("p");
                    if(textNode) {
                        view.label = newText;
                        textNode[0].textContent = view.label;
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
                return this._build();
            }

            _updateViews(view = null) {

                if (this._root === null) {
                    return;
                }

                if(view != null && view != undefined) {
                    if (view.delete) {
                        this._removeViewButton(view);
                    } else {
                        this._addViewButton(view);
                    } 
                }
                if (this._dirty == false) {
                    this._dirty = true;

                    window.setTimeout(() => {
                        this._dirty = false;
                        if (this._root !== null) {
                            
                            let child;
                            while (child = this._contentPane.lastChild) {
                                this._contentPane.removeChild(child);
                            }

                            // Update view status and switch content and set exising scroll value
                            let currView;
                            for (currView of this._views) {
                                if (currView.id === this._activeViewId) {

                                    if (currView.contentElement.parentElement !== null) {
                                        currView.contentElement.parentElement.removeChild(currView.contentElement);
                                    }

                                    this._contentPane.appendChild(currView.contentElement);
                                    this._contentPane.scrollTop = currView.scrollTop;
                                    (function (view, scope) {
                                        window.setTimeout(() => { scope._contentPane.scrollTop = view.scrollTop; }, 0);
                                    })(currView, this);

                                    if (currView.menuButton) {
                                        currView.menuButton.classList.add(o.Hamburgermenu_A._MENU_BUTTON_ACTIVE);
                                    }

                                    window.setTimeout(() => {
                                        // calculate height of menu. Has to be calculcated with JS because 100% for bg position doesn't work correctly in old Edge browser.
                                        var scrollHeight = this._menuDiv.scrollHeight;
                                        if (scrollHeight > 0) {
                                            this._menuDiv.style.backgroundPosition = "0% 0%, 0% " + (scrollHeight - 80) + "px, 0% 0%, 0% 100%";
                                        }
                                    }, 0);

                                } else {
                                    if (currView.contentElement && currView.contentElement.parentElement !== null && currView.contentElement.parentElement !== this._contentPane) {
                                        currView.contentElement.parentElement.removeChild(currView.contentElement);
                                    }
                                }
                            }
                        }
                    }, 0);
                }
            }

            _addViewButton(view) {
                let divNode = document.createElement("div");
                divNode.className = "fp-components-hamburgermenu-a-menu__button";

                let imgNode = document.createElement("div");
                imgNode.className = "fp-components-hamburgermenu-a-menu__button-icon";
                divNode.appendChild(imgNode);

                if (view.icon !== undefined) {
                    imgNode.style.backgroundImage = `url("${view.icon}")`;
                }

                let pNode = document.createElement("p");

                if (view.label !== undefined) {
                    pNode.appendChild(document.createTextNode(view.label));
                    pNode.className = "fp-components-hamburgermenu-a-menu__button-text";
                }

                divNode.appendChild(pNode);
                this._menuDiv.appendChild(divNode);

                divNode.onclick = () => {
                    for (var i = 0; i < this._menuDiv.children.length; i++) {
                        var child = this._menuDiv.children[i];
                        child.classList.remove(o.Hamburgermenu_A._MENU_BUTTON_ACTIVE);
                    }

                    divNode.classList.add(o.Hamburgermenu_A._MENU_BUTTON_ACTIVE);

                    if (this._isOpen) {
                        this._toggleOpen();
                    }

                    this.activeView = view.id;
                };

                if (view.active || this._activeViewId == null) {
                    this._activeViewId = view.id;
                }

                view.menuButton = divNode;
            }

            _removeViewButton(view) {
                const id = view.id;
                for (let i = 0; i < this._views.length; i++) {
                    let v = this._views[i];
                    if (v.id === id) {
                        if (v.contentElement.parentElement !== null) {
                            v.contentElement.parentElement.removeChild(v.contentElement);
                        }

                        if (v.menuButton.parentElement !== null) {
                            v.menuButton.style.width = "0";
                            v.menuButton.style.height = "0";
                            v.menuButton.style.margin = "0px";
                            v.menuButton.style.overFlow = "hidden";

                            window.setTimeout(() => {
                                v.menuButton.parentElement.removeChild(v.menuButton);
                                v.menuButton = null;
                                v.contentElement = null;
                            }, 0);
                        }

                        // if active view was removed, we need to activate another if possible.
                        if (this._activeViewId === v.id) {

                            var maxIndex = this._views.length - 1;
                            let newIndex;
                            // if removed index is below max, set new active index to same as removed. Else take removed index minus 1.
                            if (i < maxIndex) {
                                newIndex = i;
                            } else {
                                newIndex = i - 1;
                            }

                            // if new active index is smaller than 0, we set it to 0.
                            if (newIndex < 0) {
                                newIndex = 0;
                            }

                            // set active to new index or null.
                            if (newIndex > maxIndex) {
                                this._activeViewId = null;
                            } else {
                                this._activeViewId = this._views[newIndex].id;
                            }
                        }
                    }
                }
            }

            _toggleOpen() {
                if (this._isOpen) {
                    this._menuDiv.classList.remove(o.Hamburgermenu_A._MENU_OPEN);
                    this._overlayDiv.classList.remove(o.Hamburgermenu_A._MENU_OVERLAY_OPEN);
                    this._menuContainer.classList.remove(o.Hamburgermenu_A._MENU_CONTAINER_OPEN);
                } else {
                    this._menuDiv.classList.add(o.Hamburgermenu_A._MENU_OPEN);
                    this._overlayDiv.classList.add(o.Hamburgermenu_A._MENU_OVERLAY_OPEN);
                    this._menuContainer.classList.add(o.Hamburgermenu_A._MENU_CONTAINER_OPEN)
                }

                this._isOpen = !this._isOpen
            }

            _updateMenu() {
                if (!this._alwaysVisible && this._menuContainer.classList.contains(o.Hamburgermenu_A._MENU_ALWAYS_VISIBLE)) {
                    this._menuWrapper.classList.remove(o.Hamburgermenu_A._MENU_WRAPPER_VISIBLE);
                    this._menuContainer.classList.remove(o.Hamburgermenu_A._MENU_ALWAYS_VISIBLE);
                }

                if (this._alwaysVisible && !this._menuContainer.classList.contains(o.Hamburgermenu_A._MENU_ALWAYS_VISIBLE)) {
                    this._menuWrapper.classList.add(o.Hamburgermenu_A._MENU_WRAPPER_VISIBLE);
                    this._menuContainer.classList.add(o.Hamburgermenu_A._MENU_ALWAYS_VISIBLE);
                }
            }

            _build() {
                if (this._anchor != null) {

                    let container = document.createElement("div");
                    container.className = "fp-components-base fp-components-hamburgermenu-a-container";

                    let overlay = document.createElement("div");
                    overlay.className = "fp-components-hamburgermenu-a-overlay";
                    overlay.onclick = () => this._toggleOpen();

                    let menuWrapperNode = document.createElement("div");
                    menuWrapperNode.className = "fp-components-hamburgermenu-a-menu__wrapper";

                    let menuContainer = document.createElement("div");
                    menuContainer.className = "fp-components-hamburgermenu-a-menu__container";

                    let buttonContainerNode = document.createElement("div");
                    buttonContainerNode.className = "fp-components-hamburgermenu-a-button-container";
                    buttonContainerNode.onclick = () => this._toggleOpen();

                    let button = document.createElement("div");
                    button.className = "fp-components-hamburgermenu-a-button";

                    let menu = document.createElement("div");
                    menu.className = "fp-components-hamburgermenu-a-menu";

                    var titleDiv = document.createElement("div");
                    titleDiv.className = "fp-components-hamburgermenu-a-menu__title-container";

                    let titleTextDiv = document.createElement("div");
                    titleTextDiv.className = "fp-components-hamburgermenu-a-menu__title-text";
                    titleTextDiv.textContent = this._title;

                    let content = document.createElement("div");
                    content.className = "fp-components-hamburgermenu-a-container__content";

                    container.appendChild(overlay);
                    container.appendChild(menuWrapperNode);
                    menuWrapperNode.appendChild(menuContainer);
                    menuContainer.appendChild(titleDiv);
                    titleDiv.appendChild(titleTextDiv);
                    menuContainer.appendChild(menu);
                    menuWrapperNode.appendChild(buttonContainerNode);
                    buttonContainerNode.appendChild(button);
                    container.appendChild(content);

                    this._root = container;
                    this._contentPane = content;
                    this._menuWrapper = menuWrapperNode;
                    this._menuContainer = menuContainer;
                    this._menuDiv = menu;
                    this._buttonDiv = buttonContainerNode;
                    this._overlayDiv = overlay;
                    this._titleDiv = titleDiv;

                    this._updateMenu();

                    for (const v of this._views) {
                        this._updateViews(v);
                    }
                    this._updateViews();

                    this._anchor.appendChild(container);
                }
            }
        }

        o.Hamburgermenu_A.VERSION = "1.4";
        o.Hamburgermenu_A._MENU_OVERLAY_OPEN = "fp-components-hamburgermenu-a-overlay--open"
        o.Hamburgermenu_A._MENU_CONTAINER_OPEN = "fp-components-hamburgermenu-a-menu__container--open"
        o.Hamburgermenu_A._MENU_OPEN = "fp-components-hamburgermenu-a--open"
        o.Hamburgermenu_A._MENU_WRAPPER_VISIBLE = "fp-components-hamburgermenu-a-menu__wrapper--visible";
        o.Hamburgermenu_A._MENU_ALWAYS_VISIBLE = "fp-components-hamburgermenu-a-menu__container--visible"
        o.Hamburgermenu_A._MENU_BUTTON_ACTIVE = "fp-components-hamburgermenu-a-menu__button--active";
    }
})(FPComponents);