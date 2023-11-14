import API from '../api/index.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';

/**
 * @typedef TComponents.TemplateViewProps
 * @prop {string} [name] Example prop
 * @prop {number} [delay] Delay to simulate asynchronous actions
 */

/**
 * Reference example for building a new TComponent
 * @class TComponents.TemplateView_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.TemplateViewProps} [props] - Example of pasing a prop to the component
 * @example
 * // index.html
 * ...
 * &lt;div class="template-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const templateComp = new TComponents.TemplateView_A(document.querySelector('.template-container'), {
 *     name: 'Template Example View',
 *   });
 *
 */
export class TemplateView_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.TemplateViewProps}
     */
    this._props;

    /**
     * Used to specify which component input properties shall trigger [init]{@link TComponents.Component_A} when their value
     * is changed, i.e. by using {@link TComponents.Base_A#setProps setProps}.
     */
    this.initPropsDep('delay');

    this.btnFPComp = new FPComponents.Button_A();
    this.btnFPComp.text = `FPComponent button`;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.TemplateView_A
   * @returns {TComponents.TemplateViewProps}
   */
  defaultProps() {
    return { name: 'Template Component', delay: 0 };
  }

  /**
   * Contains component specific asynchronous implementation (like access to controller).
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * @alias onInit
   * @memberof TComponents.TemplateView_A
   * @async
   */
  async onInit() {
    // asynchronous actions are placed here
    await API.sleep(this._props.delay);
  }

  /**
   * Instantiation of TComponents sub-components that shall be initialized in a synchronous way.
   * All this components are then accessible within {@link onRender() onRender} method by using this.child.<component-instance>
   * @alias mapComponents
   * @memberof TComponents.TemplateView_A
   * @returns {object} Contains all child TComponents instances used within the component.
   */
  mapComponents() {
    return {
      btnTComp: new Button_A(this.find('.tc-example-btn'), {
        onClick: () => {
          Popup_A.message('I am a TComponent');
        },
        text: `TComponent button`,
      }),
    };
  }

  /**
   * Contians all synchronous operations/setups that may be required for any sub-component after its initialization and/or manipulation of the DOM.
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * @alias onRender
   * @memberof TComponents.TemplateView_A
   */
  onRender() {
    this.btnFPComp.onclick = this.cbOnClick.bind(this);
    this.btnFPComp.attachToElement(this.find('.fpcomponent-example-btn'));
    this.child.btnTComp.onClick(this.cbOnClick.bind(this));
  }

  /**
   * Generates the HTML definition corresponding to the component.
   * @alias markup
   * @memberof TComponents.TemplateView_A
   * @returns {string}
   */
  markup() {
    return /*html*/ `
          <div class="flex-col items-center">
            <div class="row tc-test-text">Hello World, I am ${this._props.name}</div>
            <div class="flex-row">
              <div class="tc-example-btn tc-item"></div>
              <div class="fpcomponent-example-btn tc-item"></div>
            </div>
          </div>
          `;
  }

  cbOnClick() {
    Popup_A.danger('I am another callback');
    this.trigger('click');
  }

  /**
   * Registers callback function to a click event
   * @alias onClick
   * @memberof TComponents.TemplateView_A
   * @param {function} func
   */
  onClick(func) {
    this.on('click', func);
  }
}

TemplateView_A.loadCssClassFromString(/*css*/ `

.tc-test-text {
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  color: #91a7ff;
  text-decoration: underline overline;
}
  `);
