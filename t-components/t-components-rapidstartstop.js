'use strict';

import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';

import { Button_A } from './t-components-buttons.js';
import { imgStart, imgStop, imgPlayIcon, imgStopIcon } from './img/images.js';

/**
 * @typedef RapidStartStopProps
 * @prop {boolean} [indicator] - If true (default value), the indicator is displayed. Otherwise is hidden.
 */

/**
 * Called when an instance of this component is created.
 * @class TComponents.RapidStartStop_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {RapidStartStopProps} props
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
  constructor(parent, props) {
    super(parent, props);

    /**
     * @type {RapidStartStopProps}
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
      var executionState = RWS.Rapid.getMonitor('execution');
      executionState.addCallbackOnChanged((eventData) => {
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
      var rapidstate = await RWS.Rapid.getExecutionState();
      console.log(rapidstate);
      executionState.subscribe(true);
    } catch (e) {
      this.error = true;
      Popup_A.danger('Subscribe to failed. >>>', [e.message, e.description]);
    }
  }

  mapComponents() {
    return {
      btnStart: new Button_A(this.find('.tc-btn-start'), {
        callback: this.cbStart.bind(this),
        label: 'Play',
        icon: imgPlayIcon,
      }),
      btnStop: new Button_A(this.find('.tc-btn-stop'), {
        callback: this.cbStop.bind(this),
        label: 'Stop',
        icon: imgStopIcon,
      }),
    };
  }

  onRender() {}

  markup() {
    return `

          <div class="tc-container-row tc-item">
          ${
            this._props.indicator
              ? `<img src="${imgStop}" style="width:36px ;height:36px;" class="tc-rapid-feedback tc-item"> </img>`
              : ''
          }
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

var tComponentStyle = document.createElement('style');
tComponentStyle.innerHTML = `

.tc-varincrdecr-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  min-width: fit-content;
}

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);
