import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';
import { imgStart, imgStop, imgPlayIcon, imgStopIcon } from './img/images.js';

/**
 * @typedef TComponents.RapidStartStopProps
 * @prop {boolean} [indicator] - If true (default value), the indicator is displayed. Otherwise is hidden.
 */

/**
 * Called when an instance of this component is created.
 * @class TComponents.RapidStartStop_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.RapidStartStopProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-start"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const btnStart = new RapidStartStop_A(document.querySelector('.btn-start'));
 * await btnStart.render();
 */
export class RapidStartStop_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.RapidStartStopProps}
     */
    this._props;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.RapidStartStop_A
   * @returns {TComponents.RapidStartStopProps}
   */
  defaultProps() {
    return {
      indicator: true,
    };
  }

  async onInit() {
    // subscribe to executionState
    try {
      API.RAPID.monitorExecutionState((eventData) => {
        if (eventData == 'stopped') {
          if (this._props.indicator) this.find('.tc-rapid-feedback').src = imgStop;
          this.child.btnStart.enabled = true;
          this.child.btnStop.enabled = false;
        } else if (eventData == 'running') {
          if (this._props.indicator) this.find('.tc-rapid-feedback').src = imgStart;
          this.child.btnStart.enabled = false;
          this.child.btnStop.enabled = true;
        }
      });
    } catch (e) {
      this.error = true;
      Popup_A.danger('Subscribe to failed. >>>', [e.message, e.description]);
    }
  }

  mapComponents() {
    return {
      btnStart: new Button_A(this.find('.tc-btn-start'), {
        onClick: this.cbStart.bind(this),
        text: 'Play',
        icon: imgPlayIcon,
      }),
      btnStop: new Button_A(this.find('.tc-btn-stop'), {
        onClick: this.cbStop.bind(this),
        text: 'Stop',
        icon: imgStopIcon,
      }),
    };
  }

  onRender() {}

  markup() {
    return /*html*/ `

          <div class="tc-container-row tc-item">
          ${this._props.indicator ? `<img src="${imgStop}" style="width:36px ;height:36px;" class="tc-rapid-feedback tc-item"> </img>` : ''}
            <div class="tc-btn-start tc-item"></div>
            <div class="tc-btn-stop tc-item"></div>
          </div>

          `;
  }

  async cbStart() {
    try {
      await RWS.Rapid.resetPP(); //Sets the Program Pointer to main
      await RWS.Controller.setMotorsState('motors_on'); //Turns the motors on

      await RWS.Rapid.startExecution({
        //Starts the execution of the program with the desired features
        regainMode: 'continue',
        executionMode: 'continue',
        cycleMode: 'forever',
        condition: 'none',
        stopAtBreakpoint: false,
        enableByTSP: true,
      });
    } catch (e) {
      Popup_A.error(e);
    }
  }

  async cbStop() {
    try {
      await RWS.Rapid.stopExecution();
    } catch (e) {
      Popup_A.error(e);
    }
  }
}

RapidStartStop_A.loadCssClassFromString(/*css*/ `

.tc-varincrdecr-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  min-width: fit-content;
}

`);
