import { Menu_A } from './t-components-menu.js';
import { Component_A } from './t-components-component.js';

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
 * @prop {boolean} userTabClosing Set this attribute to true to allow the user to close tabs using a button on each active tab.
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
  constructor(parent, props) {
    super(parent, props);
  }

  async onInit() {
    this.tabContainer = new FPComponents.Tabcontainer_A();

    await super.onInit();
    if (this._props.onPlus) this.on('plus', this._props.onPlus);
    if (this._props.onUserClose) this.on('userclose', this._props.onUserClose);
  }

  defaultProps() {
    return {
      onPlus: null,
      userTabClosing: false,
      onUserClose: null,
      plusEnabled: false,
      hiddenTabs: false,
      transparent: false,
    };
  }

  onRender() {
    this.tabContainer.onchange = this.cbOnChange.bind(this);
    if (this._props.onPlus) this.tabContainer.onplus = this.cbOnPlus.bind(this);
    if (this._props.onUserClose) this.tabContainer.onuserclose = this.cbOnUserClose.bind(this);
    if (this._props.title) this.tabContainer.setTabTitle = this._props.title;
    this.tabContainer.userTabClosing = this._props.userTabClosing;

    this._onRenderView();

    this.tabContainer.plusEnabled = this._props.plusEnabled;
    this.tabContainer.hiddenTabs = this._props.hiddenTabs;
    this.tabContainer.attachToElement(this.container);

    this.container.classList.add('tc-container');

    this.container.removeEventListener('click', this._handleTabClick);
    this.addEventListener(this.container, 'click', this._handleTabClick, true);

    this.container.dataset.view = 'true';

    if (this._props.transparent) {
      this.find('.fp-components-tabcontainer').classList.add('bg-transparent');
    }
  }

  _handleTabClick(e) {
    // Check if the clicked element is a tab
    const tabElement = e.target.closest('.fp-components-tabcontainer-tabbar');
    if (tabElement) {
      // Trigger the custom event on the container element
      const customEvent = new CustomEvent('tabclick', {
        detail: {
          tabElement: tabElement,
        },
        bubbles: true,
        cancelable: true,
      });
      e.target.dispatchEvent(customEvent);
    }
  }

  _onRenderView() {
    this.viewId.clear();
    this.views.forEach(({ name, content, id, active }) => {
      const dom = this._getDom(content, id, name);
      id = this.tabContainer.addTab(Component_A.t(name), dom, active);
      this.viewId.set(id, name);
    });
  }

  getProps() {
    const tempView = this._props.views;
    const ret = super.getProps();
    ret.views = ret.views.map((view, index) => {
      view.content = tempView[index].content;
      return view;
    });

    return ret;
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
    const entries = [...this.viewId.entries()].filter(([_, value]) => value === name);
    if (entries.length > 0) {
      const id = entries[0][0];
      this.tabContainer.removeTab(id);
      this.viewId.delete(id);
      this.views = this.views.filter((view) => view.name !== name);
    }
  }

  cbOnPlus() {
    this.trigger('plus');
  }

  cbOnUserClose(id) {
    const name = this.viewId.get(id);

    if (!this.props.onUserClose) return true;

    // decouple async function from original
    (async () => {
      // Wait for onUserClose to complete
      const result = await this.props.onUserClose(name);
      // If onUserClose returns true, delete the view and rerender
      if (result) {
        this.removeTab(name);
      }
    })();
    // Return false to prevent the tab from being removed immediately
    return false;
  }

  get title() {
    return this.getProps().getTabTitle;
  }

  set title(title) {
    this.setProps({ title });
  }

  get plusEnabled() {
    return this.getProps().plusEnabled;
  }

  set plusEnabled(value) {
    this.setProps({ plusEnabled: value });
  }

  get userTabClosing() {
    return this.getProps().userTabClosing;
  }

  set userTabClosing(value) {
    this.setProps({ userTabClosing: value });
  }

  get hiddenTabs() {
    return this.getProps().hiddenTabs;
  }

  set hiddenTabs(value) {
    this.setProps({ hiddenTabs: value });
  }

  get activeTab() {
    if (!this.tabContainer) throw new Error('TabContainer not initialized yet. Please render the component first');
    return this.viewId.get(this.tabContainer.activeTab);
  }

  set activeTab(name) {
    if (!this.tabContainer) throw new Error('TabContainer not initialized yet. Please render the component first');

    const entries = [...this.viewId.entries()].filter(([_, value]) => value === name);
    if (entries.length > 0) {
      this.all('.fp-components-tabcontainer-activetab').forEach((el) => {
        el.classList.remove('fp-components-tabcontainer-activetab');
      });

      const id = entries[0][0];
      this.tabContainer.activeTab = id;
    }
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
