import { Component_A } from './t-components-component.js';

/**
 * @typedef TComponents.View
 * @prop   {string}  name   Name of the view
 * @prop   {TComponents.Component_A | HTMLElement | string}  content Content of the view. It can be a TComponent, HTMLElement or an id of an HTMLElement
 * @prop   {string}  [image] Path to image of the view
 * @prop   {boolean}  [active=false] Set this attribute to true to make the view active
 */

/**
 * @typedef TComponents.MenuProps
 * @prop {string} [title] - Set this attribute to any string to display a title next to the
 * hamburger menu icon when the menu is open. Set this attribute to false (default) to hide
 * the menu when closed, and only display the hamburger menu icon.
 * @prop {Function} [onChange] Set this attribute to a callback function that should
 * be called when a new view becomes active, i.e. the container has switched view to another content element.
 * The oldViewId and newViewId parameters are both view identifier objects which respectively identify the
 * previously active view and the currently active view.
 * It is possible for one of the parameters to be null, e.g. when the first view becomes active.
 * @prop {TComponents.View[]} [views] Array of view objects
 * @prop {string} [label] Label text
 */

/**
 * Abstract class used by {@link TComponents.Hamburger_A} and {@link TComponents.Tab_A}
 * @class TComponents.Menu_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.MenuProps} [props]
 */
export class Menu_A extends Component_A {
  constructor(parent, props) {
    super(parent, props);

    this.viewId = new Map();
    this.requireMarkup = [];

    /**
     * @type {TComponents.MenuProps}
     */
    this._props;

    this.initPropsDep('views');
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Menu_A
   * @returns {TComponents.MenuProps}
   */
  defaultProps() {
    return { title: 'Menu', onChange: null, views: [] };
  }

  onInit() {
    this.views = [];
    if (this._props.onChange) this.on('change', this._props.onChange);
    if (this._props.views.length > 0) {
      this._props.views.forEach((view) => {
        view['id'] = this._processContent(view.content);
        this.views.push(view);
      });
    }
  }

  mapComponents() {
    const obj = {};

    this.views.forEach(({ content }) => {
      if (content instanceof Component_A) {
        obj[content.compId] = content;
      }
    });

    return obj;
  }

  onRender() {
    this.viewId.clear();
    this.views.forEach(({ name, content, image, active, id }) => {
      const dom = this._getDom(content, id);
      id = {};
      this.viewId.set(id, name);
    });

    this.container.classList.add('tc-container');
  }

  markup() {
    return /*html*/ `
    ${this.views.filter(({ id }) => id !== null).reduce((html, { id }) => html + `<div id="${id}"></div>`, '')}
    `;
  }

  /**
   * This attribute represents the currently active view in the form of a view identifier object.
   * Set this attribute to another view identifier object to switch view programmatically
   * @alias addView
   * @memberof TComponents.Menu_A
   * @param  {TComponents.View}  view   View object
   */
  addView(newView) {
    const views = [...this._props.views, newView];
    this.setProps({ views });
  }

  get viewList() {
    return [...this.viewId.values()];
  }

  _getDom(content, id) {
    let dom;

    if (content instanceof Component_A) {
      if (id) content.attachToElement(this.find(`#${id}`));
      dom = content.parent;
    } else {
      dom = content;
    }
    return dom;
  }

  _processContent(content) {
    let id = null;
    if (Component_A._isTComponent(content)) {
      if (!content.parent) {
        id = content.compId + '__container';
      }
    } else if (typeof content === 'string') {
      const elementId = content;
      content = document.getElementById(`${elementId}`);

      if (!content) {
        throw new Error(`Could not find element with id: ${elementId} in the DOM.
        Try adding view as Element or Component_A instance to the Hamburger menu.`);
      }
    } else if (!Component_A._isHTMLElement(content)) {
      throw new Error(`Unexpected type of view content: ${typeof content}`);
    }
    return id;
  }

  /**
   * @alias cbOnChange
   * @memberof TComponents.Menu_A
   * @param {*} oldView
   * @param {*} newView
   * @private
   */
  cbOnChange(oldView, newView) {
    this.trigger('change', this.viewId.get(oldView), this.viewId.get(newView));
  }
}
