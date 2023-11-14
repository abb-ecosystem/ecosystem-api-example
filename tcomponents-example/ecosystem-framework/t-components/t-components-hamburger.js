import { Menu_A } from './t-components-menu.js';

/**
 * @typedef TComponents.HamburgerProps
 * @prop {string} [title] - Set this attribute to any string to display a title next to the
 * hamburger menu icon when the menu is open. Set this attribute to false (default) to hide
 * the menu when closed, and only display the hamburger menu icon.
 * @prop {boolean} [alwaysVisible] - Set this attribute to true (default) to have the hamburger
 * menu always be visible. In this state the hamburger menu will be wide enough
 * for the icons of each menu item to be visible when closed. When the menu is opened,
 * it will be full width.
 * @prop {Function} [onChange] Set this attribute to a callback function that should
 * be called when a new view becomes active, i.e. the container has switched view to another content element.
 * The oldViewId and newViewId parameters are both view identifier objects which respectively identify the
 * previously active view and the currently active view.
 * It is possible for one of the parameters to be null, e.g. when the first view becomes active.
 * @prop {TComponents.View[]} [views] Array of view objects
 */

/**
 * The Hamburger Menu component implements a view-switching area with a hamburger menu. The hamburger menu can be configured to either always be visible or to only display a hamburger icon on the top left of the screen.
 * When configured to always be visible, the visible part will be only wide enough to display the icons of the menu and will push aside the content.
 * When configured to not be visible, the hamburger icon will be placed on top of the content, and on the top left. In this case it is up to the app developer to keep that area free of other elements.
 * The hamburger menu can be populated with any content and can be configured for most use cases. Any number of views are supported.
 * @class TComponents.Hamburger_A
 * @extends TComponents.Menu_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.HamburgerProps} [props]
 */
export class Hamburger_A extends Menu_A {
  constructor(parent, props) {
    super(parent, props);

    /**
     * @type {TComponents.HamburgerProps}
     */
    this._props;
  }

  onInit() {
    this._props.views.forEach((view) => {
      if (!view.hasOwnProperty('image')) view['image'] = '';
    });
    super.onInit();
  }
  defaultProps() {
    return { alwaysVisible: true };
  }

  onRender() {
    this.hamburgerMenu = new FPComponents.Hamburgermenu_A();
    this.hamburgerMenu.attachToElement(this.container);
    this.hamburgerMenu.title = this._props.title;
    this.hamburgerMenu.alwaysVisible = this._props.alwaysVisible;
    this.hamburgerMenu.onchange = this.cbOnChange.bind(this);

    this.container.dataset.view = 'true';
    this.views.forEach(({ name, content, image, active, id }) => {
      const dom = this._getDom(content, id);
      this.viewId.set(this.hamburgerMenu.addView(name, dom, image ? image : undefined, active), name);
    });
    this.find('.fp-components-hamburgermenu-a-menu__container').style.setProperty('z-index', '3');
    this.find('.fp-components-hamburgermenu-a-button-container').style.setProperty('z-index', '3');
    this.find('.fp-components-hamburgermenu-a-container').style.alignItems = 'normal';
    this.find('.fp-components-hamburgermenu-a-container').classList.add('hamburger__container');
    this.find('.fp-components-hamburgermenu-a-container__content').classList.add('hamburger__container', 'flex-col', 'justify-stretch');

    // this.find('.fp-components-hamburgermenu-a-container__content').style.setProperty(
    //   'overflow',
    //   'visible'
    // );

    // const baseEl = this.container.querySelector('.fp-components-base');
    // baseEl.classList.remove('fp-components-base');
    this.container.classList.add('tc-container');
    this.container.classList.add('hamburger-base-style');
  }

  /**
   * Add a new view to the hamburger menu. If image is no passed, a empty string will be assigned to the image property
   * @alias addView
   * @memberof TComponents.Hamburger_A
   * @param  {TComponents.View}  view   View object
   */
  addView(newView) {
    if (!newView.hasOwnProperty['image']) newView['image'] = '';
    super.addView(newView);
  }

  get activeView() {
    return this.viewId.get(this.hamburgerMenu.activeView);
  }

  set activeView(name) {
    this.hamburgerMenu.activeView = [...this.viewId.entries()].filter(([_, value]) => value === name)[0][0];
  }
}

Hamburger_A.loadCssClassFromString(/*css*/ `

.hamburger-base-style {
  background-color: transparent !important;
  border: 1px solid var(--t-color-GRAY-30);
  border-top: none;
  border-buttom: none;
  border-right: none;
}

.hamburger__container {
  max-width: inherit;
}
`);
