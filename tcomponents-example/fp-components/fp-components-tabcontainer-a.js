
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

fpComponentsLoadCSS("fp-components/fp-components-tabcontainer-a.css");

var FPComponents = FPComponents || {};

(function(o) {
    if (!o.hasOwnProperty("Tabcontainer_A")) {
        o.Tabcontainer_A = class {
            constructor() {
                this._anchor = null;
                this._root = null;
                this._tabs = [];
                this._tabQueue = [];
                this.__activeTabId = undefined;
                this._tabBar = null;
                this._tabBarOuter = null;
                this._dirty = false;
                this._tabScrollDirty = false;
                this._userTabClosing = false;
                this._onplus = null;
                this._plusEnabled = true;
                this._plusButton = null;
                this._onchange = null;
                this._onuserclose = null;
                this._hiddenTabs = false;
                this._contentPane = null;
            }
            get parent() {
                return this._anchor;
            }
            get onplus() {
                return this._onplus;
            }
            set onplus(cb) {
                this._onplus = cb;
                this._updatePlusButton();
            }
            get onchange() {
                return this._onchange;
            }
            set onchange(c) {
                this._onchange = c;
            }
            get onuserclose() {
                return this._onuserclose;
            }
            set onuserclose(c) {
                this._onuserclose = c;
            }
            get plusEnabled() {
                return this._plusEnabled;
            }
            set plusEnabled(p) {
                this._plusEnabled = p == true;
                this._updatePlusButton();
            }
            get userTabClosing() {
                return this._userTabClosing;
            }
            set userTabClosing(u) {
                this._userTabClosing = u == true;
                this._updateTabs();
            }
            get hiddenTabs() {
                return this._hiddenTabs;
            }
            set hiddenTabs(h) {
                this._hiddenTabs = h == true;
                this._updateOuterTabBarVisibility();
            }
            get tabIdList() {
                let list = [];
                for (const t of this._tabs) {
                    list.push(t.id);
                }
                return list;
            }
            get activeTab() {
                return this._activeTabId;
            }
            set activeTab(id) {
                let tab;
                for (let t of this._tabs) {
                    if (t.id === this._activeTabId) {
                        tab = t;
                        break;
                    }
                }
                if (tab) {
                    tab.scrollTop = this._contentPane.scrollTop;
                }
                this._activeTabId = id;
                this._updateTabs();
            }
            get _activeTabId() {
                return this.__activeTabId;
            }
            set _activeTabId(id) {
                let old = this.__activeTabId;
                this.__activeTabId = id;
                if (this._onchange !== null && typeof this._onchange === "function") {
                    this._onchange(old, id);
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
                return this._rebuild();
            }
            addTab(title, contentElement, makeActive = false) {
                if (typeof contentElement === "string") {
                    contentElement = document.getElementById(contentElement);
                }
                let id = {};
                this._tabQueue.push({
                    id: id,
                    title: title,
                    contentElement: contentElement,
                    makeActive: makeActive
                });
                this._updateTabs();
                return id;
            }
            getTabTitle(id) {
                for (const t of this._tabs) {
                    if (t.id === id) {
                        return t.title;
                    }
                }
                return null;
            }
            setTabTitle(id, title) {
                var tab = this._tabs.find(t => t.id === id);
                if (tab) {
                    tab.title = title;
                    if (tab.rootTitleDiv) {
                        tab.rootTitleDiv.textContent = title;
                    }
                }
            }
            removeTab(id) {
                this._tabQueue.push({
                    id: id,
                    delete: true
                });
                this._updateTabs();
            }
            _scrollLeft() {
                this._tabBar.scrollLeft -= 200;
            }
            _scrollRight() {
                this._tabBar.scrollLeft += 200;
            }
            _plusButtonAction() {
                if (this._plusEnabled && typeof this._onplus === "function") {
                    this._onplus();
                }
            }
            _updateOuterTabBarVisibility() {
                if (this._tabBarOuter !== null) {
                    if (this._hiddenTabs) {
                        this._tabBarOuter.style.display = "none";
                    } else {
                        this._tabBarOuter.style.display = null;
                    }
                }
            }
            _updatePlusButton() {
                if (this._plusButton !== null) {
                    if (this._onplus !== null && typeof this._onplus === "function") {
                        this._plusButton.style.display = null;
                    } else {
                        this._plusButton.style.display = "none";
                    }
                    if (this._plusEnabled) {
                        this._plusButton.style.backgroundImage = "url('fp-components/img/svg/abb_plus_24.svg')";
                        this._plusButton.style.backgroundColor = null;
                        this._plusButton.className = o.Tabcontainer_A._SIDEBUTTON_ENABLED;
                    } else {
                        this._plusButton.style.backgroundImage = "url('fp-components/img/svg/abb_plus_grey_mod_24.svg')";
                        this._plusButton.style.backgroundColor = "var(--fp-color-GRAY-10)";
                        this._plusButton.className = o.Tabcontainer_A._SIDEBUTTON_DISABLED;
                    }
                }
            }
            _updateScrollButtons(scrollToRight = false) {
                let t = this._tabBar;
                if (t.clientWidth === t.scrollWidth) {
                    this._leftButton.style.display = "none";
                    this._rightButton.style.display = "none";
                } else {
                    this._leftButton.style.display = null;
                    this._rightButton.style.display = null;
                    if (scrollToRight) {
                        t.scrollLeft = t.scrollWidth - t.clientWidth;
                    }
                    if (t.scrollLeft == 0) {
                        this._leftButton.style.backgroundImage = "url('fp-components/img/svg/abb_left_grey_mod_24.svg')";
                        this._leftButton.style.backgroundColor = "var(--fp-color-GRAY-10)";
                        this._leftButton.className = o.Tabcontainer_A._SIDEBUTTON_DISABLED;
                    } else {
                        this._leftButton.style.backgroundImage = "url('fp-components/img/svg/abb_left_24.svg')";
                        this._leftButton.style.backgroundColor = null;
                        this._leftButton.className = o.Tabcontainer_A._SIDEBUTTON_ENABLED;
                    }
                    if (t.scrollLeft === t.scrollWidth - t.clientWidth) {
                        this._rightButton.style.backgroundImage = "url('fp-components/img/svg/abb_right_grey_mod_24.svg')";
                        this._rightButton.style.backgroundColor = "var(--fp-color-GRAY-10)";
                        this._rightButton.className = o.Tabcontainer_A._SIDEBUTTON_DISABLED;
                    } else {
                        this._rightButton.style.backgroundImage = "url('fp-components/img/svg/abb_right_24.svg')";
                        this._rightButton.style.backgroundColor = null;
                        this._rightButton.className = o.Tabcontainer_A._SIDEBUTTON_ENABLED;
                    }
                }
            }
            _tabBarChanged() {
                if (!this._tabScrollDirty) {
                    this._tabScrollDirty = true;
                    window.setTimeout(() => {
                        this._tabScrollDirty = false;
                        this._updateScrollButtons(false);
                    }, 200);
                }
            }
            _updateTabs() {
                if (!this._dirty) {
                    this._dirty = true;
                    window.setTimeout(() => {
                        this._dirty = false;
                        if (this._root !== null) {
                            let t;
                            while (t = this._tabQueue.shift()) {
                                if (t.delete === true) {
                                    this._removeTabImpl(t);
                                } else {
                                    this._addTabImpl(t);
                                }
                            }
                            this._updateScrollButtons(false);
                            let child;
                            while (child = this._contentPane.lastChild) {
                                this._contentPane.removeChild(child);
                            }
                            for (t of this._tabs) {
                                if (t.id === this._activeTabId) {
                                    if (this._userTabClosing) {
                                        t.root.className = o.Tabcontainer_A._TAB_ACTIVE;
                                    } else {
                                        t.root.className = o.Tabcontainer_A._TAB_ACTIVE_NO_CLOSE;
                                    }
                                    if (t.contentElement.parentElement !== null) {
                                        t.contentElement.parentElement.removeChild(t.contentElement);
                                    }
                                    this._contentPane.appendChild(t.contentElement);
                                    this._contentPane.scrollTop = t.scrollTop;
                                    (function(t, scope) {
                                        window.setTimeout(() => {
                                            scope._contentPane.scrollTop = t.scrollTop;
                                        }, 0);
                                    })(t, this);
                                } else {
                                    t.root.className = "";
                                    if (t.contentElement.parentElement !== null && t.contentElement.parentElement !== this._contentPane) {
                                        t.contentElement.parentElement.removeChild(t.contentElement);
                                    }
                                }
                            }
                        }
                    }, 0);
                }
            }
            _addTabImpl(t) {
                let parent = t.contentElement.parentElement;
                if (parent !== null) {
                    parent.removeChild(t.contentElement);
                }
                let tab = document.createElement("div");
                let top = document.createElement("div");
                let mid = document.createElement("div");
                let bottom = document.createElement("div");
                let text1 = document.createElement("div");
                let text2 = document.createElement("div");
                text2.textContent = t.title;
                let xButton = document.createElement("div");
                tab.appendChild(top);
                tab.appendChild(mid);
                mid.appendChild(text1);
                text1.appendChild(text2);
                mid.appendChild(xButton);
                tab.appendChild(bottom);
                (function(id, scope) {
                    tab.addEventListener("click", e => {
                        scope.activeTab = id;
                        e.stopPropagation();
                    });
                    xButton.addEventListener("click", e => {
                        e.stopPropagation();
                        if (scope._onuserclose !== null && typeof scope._onuserclose === "function") {
                            if (scope._onuserclose(id)) {
                                scope.removeTab(id);
                            }
                        } else {
                            scope.removeTab(id);
                        }
                    });
                })(t.id, this);
                t.root = tab;
                t.rootTitleDiv = text2;
                this._tabs.push(t);
                this._tabBar.appendChild(tab);
                if (t.makeActive || this._activeTabId === undefined) {
                    this._activeTabId = t.id;
                    this._updateScrollButtons(true);
                } else {
                    this._updateScrollButtons(false);
                }
            }
            _removeTabImpl(t) {
                for (let x = 0; x < this._tabs.length; x++) {
                    let t2 = this._tabs[x];
                    if (t2.id === t.id) {
                        if (t2.contentElement.parentElement !== null) {
                            t2.contentElement.parentElement.removeChild(t2.contentElement);
                        }
                        if (t2.root.parentElement !== null) {
                            t2.root.style.width = "0";
                            t2.root.style.minWidth = "0";
                            t2.root.style.maxWidth = "0";
                            t2.root.style.margin = "0px 0px 0px 0px";
                            t2.root.style.overflowX = "hidden";
                            (function(root, scope) {
                                window.setTimeout(() => {
                                    root.parentElement.removeChild(root);
                                    window.setTimeout(() => {
                                        scope._updateScrollButtons();
                                    }, 200);
                                }, 300);
                            })(t2.root, this);
                        }
                        this._tabs.splice(x, 1);
                        if (this._activeTabId === t2.id) {
                            let newIx;
                            if (this._tabBar.clientWidth !== this._tabBar.scrollWidth && this._tabBar.scrollLeft == this._tabBar.scrollWidth - this._tabBar.clientWidth) {
                                newIx = x - 1;
                            } else {
                                newIx = x;
                            }
                            if (newIx < 0) {
                                newIx = 0;
                            } else if (newIx >= this._tabs.length) {
                                newIx = this._tabs.length - 1;
                            }
                            if (newIx < 0 || newIx >= this._tabs.length) {
                                this._activeTabId = null;
                            } else {
                                this._activeTabId = this._tabs[newIx].id;
                            }
                        }
                        break;
                    }
                }
            }
            _rebuild() {
                let container = document.createElement("div");
                container.className = "fp-components-tabcontainer";
                let leftButton = document.createElement("div");
                leftButton.className = "fp-components-tabcontainer-sidebutton";
                let rightButton = document.createElement("div");
                rightButton.className = "fp-components-tabcontainer-sidebutton";
                let plusButton = document.createElement("div");
                plusButton.className = "fp-components-tabcontainer-sidebutton";
                let dynSpace = document.createElement("div");
                dynSpace.className = "fp-components-tabcontainer-dynspace";
                let tabBar = document.createElement("div");
                tabBar.className = "fp-components-tabcontainer-tabbar";
                let tabBarOuter = document.createElement("div");
                let content = document.createElement("div");
                rightButton.style.marginLeft = "8px";
                leftButton.onclick = () => {
                    this._scrollLeft();
                };
                rightButton.onclick = () => {
                    this._scrollRight();
                };
                plusButton.onclick = () => {
                    this._plusButtonAction();
                };
                container.appendChild(tabBarOuter);
                tabBarOuter.appendChild(leftButton);
                tabBarOuter.appendChild(tabBar);
                tabBarOuter.appendChild(rightButton);
                tabBarOuter.appendChild(plusButton);
                tabBarOuter.appendChild(dynSpace);
                container.appendChild(content);
                this._root = container;
                this._tabBarOuter = tabBarOuter;
                this._tabBar = tabBar;
                this._contentPane = content;
                this._leftButton = leftButton;
                this._rightButton = rightButton;
                this._plusButton = plusButton;
                this._anchor.appendChild(container);
                tabBar.addEventListener("scroll", e => {
                    this._tabBarChanged();
                });
                window.addEventListener("resize", e => {
                    this._tabBarChanged();
                });
                this._updateTabs();
                this._updatePlusButton();
                this._updateScrollButtons(false);
                this._updateOuterTabBarVisibility();
            }
        };
        o.Tabcontainer_A.VERSION = "1.4.1";
        o.Tabcontainer_A._SIDEBUTTON_ENABLED = " fp-components-tabcontainer-sidebutton fp-components-tabcontainer-sidebutton-active ";
        o.Tabcontainer_A._SIDEBUTTON_DISABLED = " fp-components-tabcontainer-sidebutton ";
        o.Tabcontainer_A._TAB_ACTIVE_NO_CLOSE = " fp-components-tabcontainer-activetab fp-components-tabcontainer-activetab-noclose ";
        o.Tabcontainer_A._TAB_ACTIVE = " fp-components-tabcontainer-activetab ";
    }
})(FPComponents);