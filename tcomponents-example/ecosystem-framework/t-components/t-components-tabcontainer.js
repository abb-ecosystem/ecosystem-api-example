import { Menu_A } from './t-components-menu.js';

/**
 * @typedef TabContainerProps
 * @prop {string} [title] - Set this attribute to any string to display a title next to the
 * hamburger menu icon when the menu is open. Set this attribute to false (default) to hide
 * the menu when closed, and only display the hamburger menu icon.
 * @prop {Function} [onChange] Set this attribute to a callback function that should
 * be called when a new view becomes active, i.e. the container has switched view to another content element.
 * The oldViewId and newViewId parameters are both view identifier objects which respectively identify the
 * previously active view and the currently active view.
 * It is possible for one of the parameters to be null, e.g. when the first view becomes active.
 * @prop {Function} [onPlus] Set this attribute to a callback function that should be called when the user clicks on the plus ("add-tab") button. Clicking the button has no effect other than this callback function being called.
 * Typically, this callback function will dynamically build a new view and then add it as a new tab using the addTab method.
 * Setting this attribute to a function will cause the plus button to appear in the tab bar.
 * @prop {Function} [onUserClose] Set this attribute to a callback function that should be called when the user clicks on a tab's "close" button. The parameter tabId is the tab identifier object for the tab being closed.
 * If this attribute is not set, the tab will be closed immediately. If it is set to a function, that function will be called, and if the function returns true, the tab will be removed directly.
 * If the function returns false, the tab will not be removed, and it is up to the developer to later close the tab using the removeTab method. This is useful for implementing user interaction when
 * closing the tab, e.g. "Do you want to save?" or "Do you really want to close?".onplus
 * @prop {boolean} [plusEnabled] Set this attribute to false to disable and gray out the plus ("add-tab") button, whenever visible.
 * @prop {boolean} [hiddenTabs] Set this attribute to true to completely hide the tab bar. This means that only the tab content will be visible.
 * This is useful for using the Tab container component as a generic view-switcher.
 * Default value is false.
 * @prop {TComponents.View[]} [views] Array of view objects
 */

/**
 * The Tab container component implements a view-switching area with a visual tab bar at the top.
 * It can be populated with any content and can be configured for most use cases. Any number of tabs are supported.
 * Optionally, the component can be used as a generic view-switcher without any visible tab bar.
 * @class TComponents.TabContainer_A
 * @extends TComponents.Menu_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.TabContainerProps} [props]
 */
export class TabContainer_A extends Menu_A {
  /**
   * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
   * @param {TabContainerProps} props
   */
  constructor(parent, props) {
    super(parent, props);

    this.tabContainer = new FPComponents.Tabcontainer_A();
    this.tabContainer.onchange = this.cbOnChange.bind(this);
    if (this._props.onPlus) this.tabContainer.onplus = this.cbOnPlus.bind(this);
    this.tabContainer.onuserclose = this.cbOnUserClose.bind(this);
  }

  defaultProps() {
    return {
      onPlus: null,
      onUserClose: null,
      plusEnabled: false,
      hiddenTabs: false,
    };
  }

  onRender() {
    this.views.forEach(({ name, content, id }) => {
      const dom = this._getDom(content, id);
      this.viewId.set(this.tabContainer.addTab(name, dom), name);
    });
    this.tabContainer.plusEnabled = this._props.plusEnabled;
    this.tabContainer.hiddenTabs = this._props.hiddenTabs;
    this.tabContainer.attachToElement(this.container);
    this.container.classList.add('tc-container');
  }

  /**
   *
   * @alias addTab
   * @memberof TComponents.TabContainer_A
   * @param  {TComponents.View}  view   View object
   */
  addTab({ name, content }) {
    this.addView({ name, content });
  }

  removeTab(name) {
    this.tabContainer.removeTab(
      [...this.viewId.entries()].filter(([_, value]) => value === name)[0][0]
    );
  }

  cbOnPlus() {
    this.trigger('plus');
  }

  cbOnUserClose() {
    this.trigger('userclose');
  }

  get getTabTitle() {
    return this.tabContainer.getTabTitle;
  }

  set setTabTitle(title) {
    this.tabContainer.setTabTitle = title;
  }

  get plusEnabled() {
    return this.tabContainer.plusEnabled;
  }

  set plusEnabled(value) {
    this._props.plusEnabled = value;
    this.tabContainer.plusEnabled = value;
  }

  get userTabClosing() {
    return this.tabContainer.userTabClosing;
  }

  set userTabClosing(value) {
    this.tabContainer.userTabClosing = value;
  }

  get hiddenTabs() {
    return this.tabContainer.hiddenTabs;
  }

  set hiddenTabs(value) {
    this._props.hiddenTabs = value;
    this.tabContainer.hiddenTabs = value;
  }

  get activeTab() {
    return this.viewId.get(this.tabContainer.activeTab);
  }

  set activeTab(name) {
    this.tabContainer.activeTab = [...this.viewId.entries()].filter(
      ([_, value]) => value === name
    )[0][0];
  }
}

TabContainer_A.loadCssClassFromString(/*css*/ `

.tabContainer-content-style {
  overflow : visible !important;
}

.tabContainer-base-style {
  background-color: transparent !important;
}
  `);
