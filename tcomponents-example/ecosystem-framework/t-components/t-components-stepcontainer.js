import { imgCloseIcon } from './img/images.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';
import { TabContainer_A } from './t-components-tabcontainer.js';

/**
 * @class StepContainer_A
 * @classdesc This class is a multi step wizard element
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - The parent element to which the view will be rendered
 * @param {Object} props - The properties object to be passed to the view
 */
export class StepContainer_A extends Component_A {
  constructor(parent, props) {
    super(parent, props);

    Object.defineProperty(this, '_isView', {
      value: true,
      writable: false,
    });
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.StepContainer_A
   * @returns {TComponents.StepContainerProps}
   */
  defaultProps() {
    return { views: [], onNext: null, onBack: null, onClose: null, transparent: false };
  }

  /**
   * Contains component specific asynchronous implementation (like access to controller).
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * Define behavior for next/back buttons
   * @alias onInit
   * @memberof StepContainer_A
   */
  async onInit() {
    if (this._props.onNext) this.on('next', this._props.onNext);
    if (this._props.onBack) this.on('back', this._props.onBack);
  }

  mapComponents() {
    const tabContainer = new TabContainer_A(this.find('.step-tabcontainer'), {
      views: this._props.views,
      hiddenTabs: true,
      transparent: this._props.transparent,
    });

    const closeBtn = this._props.onClose
      ? new TComponents.Button_A(this.find('.wiz-close-button'), {
          text: '',
          icon: imgCloseIcon,
          onClick: () => this._props.onClose(),
        })
      : null;

    const nextBtn = new TComponents.Button_A(this.find('.next-button'), {
      text: 'Next',
      onClick: () => {
        const index = Array.from(this.all('.step-index')).indexOf(this.find('.active'));
        // Change the step indicator style depending on the index
        this.changeStep('next', index);
        this.handleNextButton(index);
      },
    });
    const backBtn = new TComponents.Button_A(this.find('.back-button'), {
      text: 'Back',
      onClick: () => {
        const index = Array.from(this.all('.step-index')).indexOf(this.find('.active'));
        // Change the step indicator style depending on the index
        this.changeStep('back', index);
        this.handleBackButton(index);
      },
    });

    return { closeBtn, nextBtn, backBtn, tabContainer };
  }

  /**
   * Contains all synchronous operations/setups that may be required for any sub-component after its initialization and/or manipulation of the DOM.
   * This method is called internally during rendering process orchestrated by {@link render() render}.
   * Create the buttons and the initialize the srep of wizard
   * @alias onRender
   * @memberof StepContainer_A
   */
  onRender() {
    this.container.dataset.view = 'true';
    this.container.classList.add('flex-col', 'justify-stretch');

    if (this._props.transparent) {
      this.find('.view-main-menu').classList.add('bg-transparent');
    }

    if (this.child.tabContainer.views.length < 2) {
      Popup_A.warning('Multi step', [`The number of steps is less than 2.`, 'Please add more steps to the wizard.']);
      return;
    }

    const stepIndex = this.all('.step-index');
    stepIndex[0].classList.add('active');
  }

  /**
   * Render the steps of the wizard
   * @alias renderSteps
   * @memberof StepContainer_A
   * @param {Object} view - The view object
   * @param {number} index - The index of the view
   * @returns {string}
   */
  markupSteps(view, index) {
    return /*html*/ `
      <div class="step-cont flex-col items-center">
        <div class="view-step">
          ${view.name}
        </div>
        <div class="step-index">${index + 1}</div>
      </div>
      `;
  }

  /**
   * Generates the HTML definition corresponding to the component.
   * html elements for different components in the layout
   * @alias markup
   * @memberof StepContainer_A
   * @returns {string}
   */
  markup() {
    return this._props.views.length < 2
      ? `No enough views to render. Please add at least two views.`
      : /*html*/ `
            <div class="view-main-menu grow-0">
              ${Component_A.mIf(this._props.onClose, /*html*/ `<div class="wiz-close-button"></div>`)}
              <div class="view-main flex justify-center">
                ${Component_A.mFor(this._props.views, this.markupSteps.bind(this))}
              </div>
            </div>
            <div class="step-tabcontainer flex-col justify-stretch"></div>

            <div class="step-ctrl grow-0 flex-row justify-end items-center pb-2 pt-2">
              <div class="back-button"></div>
              <div class="next-button mr-3 ml-3"></div>
            </div>

        `;
  }

  /**
   * Change the page and step indicator depending on the control
   * @alias changeStep
   * @memberof StepContainer_A
   * @param {string} action - The action to be performed
   * @param {number} currentIndex - The index of the current step
   */
  changeStep(action, currentIndex) {
    const nextIndex = action === 'next' ? currentIndex + 1 : currentIndex - 1;
    const status = action === 'next' ? 'completed' : 'default';

    this.changeStepIndicator(currentIndex, status);
    if (nextIndex >= 0 && nextIndex < this.child.tabContainer.viewList.length) {
      this.changeStepIndicator(nextIndex, 'active');
      this.child.tabContainer.activeTab = this.child.tabContainer.viewList[nextIndex];
    }
  }

  /**
   * Change the step indicator depending on the index
   * @alias changeStepIndicator
   * @memberof StepContainer_A
   * @param {number} index - The index of the step
   * @param {string} backgroundColor - The background color of the step
   * @param {string} color - The color of the step
   */
  changeStepIndicator(index, stepState) {
    const stepIndex = this.all('.step-index');

    // Remove all possible classes first
    stepIndex[index].classList.remove('completed', 'active', 'default');

    let innerHTMLContent;
    if (stepState === 'completed') {
      innerHTMLContent = '&#x2713';
    } else if (stepState === 'active' || stepState === 'default') {
      innerHTMLContent = index + 1;
    }

    stepIndex[index].innerHTML = innerHTMLContent;
    stepIndex[index].classList.add(stepState);
  }

  /**
   * Events when clicking the next button
   * @alias handleNextButton
   * @memberof StepContainer_A
   * @param {number} index - The index of the page
   */
  handleNextButton(index) {
    const viewList = this.child.tabContainer.viewList;
    if (index >= 0 && index < this._props.views.length) {
      switch (index) {
        case 0:
          // Unhide the back button
          this.find('.back-button').style.display = 'block';

          // when having only 2 views, case 0: wins to case viewList.length - 2:, therefore here explicit check
          if (viewList.length === 2) {
            this.child.nextBtn.text = 'Save';
          }

          break;
        case viewList.length - 2:
          // Change the next button text to save
          this.child.nextBtn.text = 'Save';
          break;
        case viewList.length - 1:
          // Set the page back to default
          this.resetDefault();
          break;
      }
    }

    this.trigger('next', index, this._props.views[index].name);
  }

  /**
   * Reset the mulitstep wizard to its default state
   * @alias resetDefault
   * @memberof StepContainer_A
   */
  resetDefault() {
    const viewList = this.child.tabContainer.viewList;
    this.find('.back-button').style.display = 'none';
    this.child.tabContainer.activeTab = viewList[0];
    this.child.nextBtn.text = 'Next';
    this.child.nextBtn.enabled = true;
    viewList.forEach((view, i) => {
      this.changeStepIndicator(i, i === 0 ? 'active' : 'default');
    });
  }

  /**
   * Events when clicking the back button
   * @alias handleBackButton
   * @memberof StepContainer_A
   * @param {number} index - The index of the page
   */
  handleBackButton(index) {
    if (index === 1) {
      this.find('.back-button').style.display = 'none';
    } else if (index === this.child.tabContainer.viewList.length - 1) {
      this.child.nextBtn.text = 'Next';
    } else if (index > 0 && this.child.nextBtn.enabled === false) {
      this.nextBtnEnable(true);
    }

    this.trigger('back', index, this._props.views[index].name);
  }

  /**
   * Enable or disable the next button
   * @alias nextBtnEnable
   * @memberof StepContainer_A
   * @param {boolean} value - The value to enable or disable the button
   */
  nextBtnEnable(value) {
    this.child.nextBtn.enabled = value;
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 * @memberof StepContainer_A
 */
StepContainer_A.loadCssClassFromString(/*css*/ `
  .view-main-menu{
    display: flex;
    justify-content: center;
    padding: 1.75rem;
    margin: 0.5rem 0.5rem 0 0.5rem;
    border-radius: 8px;
    border-style: solid;
    border-width: thin;
    border-color: var(--t-color-GRAY-40);
    background: white
  }
  .step-tabcontainer {
    padding: 10px 10px 0 10px;
    border-radius: 10px;
  }
  .step-tabcontainer .fp-components-tabcontainer {
    border-radius: 10px;
  }
  .view-main-menu .wiz-close-button {
    position: absolute;
    right: 10px;
    top: 10px;
  }
  .wiz-close-button .fp-components-button {
    min-width: 10px;
    padding: 0 0.75rem;
  }
  .wiz-close-button .fp-components-button-icon {
    margin: 0;
    width: 16px;
    height: 16px;
  }
  .step-cont{
    width: 90px;
    position: relative;
  }
  .step-index{
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #D9D9D9;
  }
  .step-index.completed {
    background-color: #329A5D;
    color: #fff;
  }
  .step-index.active {
    background-color: #3366FF;
    color: #fff;
  }
  .step-index.default {
    background-color: #D9D9D9;
    color: #000;
  }
  .step-cont::before {
    content: "";
    position: absolute;
    width: 45px;
    height: 0.25px;
    background-color: #000;
    top: 38px;
    left: -23px;
  }
  .step-cont:first-child::before {
    display: none;
  }
  .step-ctrl{
    display: flex;
    right: 0px;
    bottom: 12px;
    z-index: 3;
  }
  .back-button{
    display: none;
  }
`);
