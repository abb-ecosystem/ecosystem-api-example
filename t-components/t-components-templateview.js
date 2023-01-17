// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('TemplateView_A')) {
    /**
     * Reference example for building a new TComponent
     * @class TComponents.TemplateView_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} parent - DOM element in which this component is to be inserted
     * @param {string} [name] - Example of pasing a prop to the component
     *
     */
    o.TemplateView_A = class TemplateView extends TComponents.Component_A {
      constructor(parent, name = 'Template Component') {
        super(parent);
        this.name = name;
        this.btnFPComp = new FPComponents.Button_A();
        this.btnFPComp.text = `FPComponent button`;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @alias onInit
       * @memberof TComponents.TemplateView_A
       * @async
       */
      onInit() {
        this.btnFPComp.onclick = this.cbOnClick.bind(this);
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
          btnTComp: new TComponents.Button_A(
            this.find('.tc-example-btn'),
            () => {
              TComponents.Popup_A.message('I am a TComponent');
            },
            `TComponent button`
          ),
        };
      }

      /**
       * Contians all synchronous operations/setups that may be required for any sub-component after its initialization and/or manipulation of the DOM.
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @alias onRender
       * @memberof TComponents.TemplateView_A
       */
      onRender() {
        this.btnFPComp.attachToElement(this.find('.fpcomponent-example-btn'));
        this.child.btnTComp.onClick(this.cbOnClick.bind(this));
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @alias markup
       * @memberof TComponents.TemplateView_A
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({ name }) {
        return `
          <div class="row tc-test-text">Hello World, I am ${name}</div>
          <div class="tc-container-row">
            <div class="tc-example-btn tc-item"></div>
            <div class="fpcomponent-example-btn tc-item"></div>
          </div>
          
          `;
      }

      cbOnClick() {
        TComponents.Popup_A.danger('I am another callback');
        this.trigger('click');
      }

      /**
       * Registers callback function to a click event
       * @alias onClick
       * @param {function} func
       */
      onClick(func) {
        this.on('click', func);
      }
    };
  }
})(TComponents);

var componentStyle = document.createElement('style');
componentStyle.innerHTML = `

.tc-test-text {
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  color: #91a7ff; 
  text-decoration: underline overline;
}
  `;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(componentStyle, ref);