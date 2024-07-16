import { TabContainer_A } from './t-components-tabcontainer.js';

/**
 * @typedef TComponents.TabContainerProps
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
 * @class TComponents.TabContainer_B
 * @extends TComponents.Menu_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.TabContainerProps} [props]
 */
export class TabContainer_B extends TabContainer_A {
  constructor(parent, props) {
    super(parent, props);
  }

  defaultProps() {
    return super.defaultProps();
  }

  onRender() {
    this.container.classList.add('tc-tab-container-b');
    super.onRender();
  }
}

TabContainer_B.loadCssClassFromString(/*css*/ `

.tc-tab-container-b .tabContainer-content-style {
  overflow : visible !important;
}

.tabContainer-base-style {
  background-color: transparent !important;
}

.tc-tab-container-b .title {
  font-weight: bold;
}
.tc-tab-container-b > .fp-components-tabcontainer > div > .fp-components-tabcontainer-tabbar > * > :nth-child(1), .fp-components-tabcontainer-tabbar > * > :nth-child(3) {
  height: 0px !important;
}
.tc-tab-container-b > .fp-components-tabcontainer > :nth-child(1) {
  background-color: var(--t-color-GRAY-30);
  padding-left: 0px !important;
  border-radius: 6px;
  margin-left: 10px;
  margin-right: 10px;
}
.tc-tab-container-b > .fp-components-tabcontainer > div > .fp-components-tabcontainer-tabbar{
  border-radius: 10px;
}
.tc-tab-container-b > .fp-components-tabcontainer > div > .fp-components-tabcontainer-tabbar > * {
  background-color: #FFF !important;
  margin: 2px !important;
  border-radius: 4px;

}
.tc-tab-container-b > .fp-components-tabcontainer > div > .fp-components-tabcontainer-tabbar > .fp-components-tabcontainer-activetab {
  background-color: var(--t-color-BLUE-60)  !important;
  color: #FFF;
}
  `);
