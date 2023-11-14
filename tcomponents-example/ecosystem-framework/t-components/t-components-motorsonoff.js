import API from '../api/index.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';

import { imgMotorsOn, imgMotorsOff } from './img/images.js';

/**
 * Called when an instance of this component is created.
 * @class TComponents.MotorsOnOff_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @example
 * // index.html
 * ...
 * &lt;div class="switch-motors"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const switchMotors = new MotorsOnOff_A(document.querySelector('.switch-motors'));
 * await switchMotors.render();
 */
export class MotorsOnOff_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this._switch = new FPComponents.Switch_A();
  }

  async onInit() {
    this._switch.desc = 'Enable';
    this._switch.onchange = (value) => {
      value ? this.cbSwitch('on') : this.cbSwitch('off');
    };

    try {
      var execution = await RWS.IO.getSignal('scDriveEnableFeedback');
      await API.CONTROLLER.monitorOperationMode(this.cbOpModeStateChanged.bind(this));

      // check for initial state
      (await execution.getValue()) === 0 ? (this.imgInit = imgMotorsOff) : (this.imgInit = imgMotorsOn);

      if (this.imgInit === imgMotorsOff) this._switch.active = false;
      else this._switch.active = true;

      // subscriber for motors on
      execution.addCallbackOnChanged((newValue) => {
        this.setIcon(newValue);
      });
      await execution.subscribe();
    } catch (e) {
      this.error = true;
      Popup_A.error(e, `TComponents.MotorsOnOff_A`);
    }
  }

  onRender() {
    this._switch.attachToElement(this.find('.fpcomponent-switch'));
    this.find('.tc-motorsonoff-feedback').src = this.imgInit;

    this.enabled = API.CONTROLLER.isAuto;
  }

  markup({ imgInit }) {
    return /*html*/ `

        <div class="tc-container-row tc-item">
          <img src='${imgInit}' style="width:36px ;height:36px;" class="tc-motorsonoff-feedback tc-item"> </img>
          <div class="fpcomponent-switch tc-item"></div>
        </div>

        `;
  }

  async setIcon(val) {
    if (val == 0) {
      this.find('.tc-motorsonoff-feedback').src = imgMotorsOff;
      this.imgInit = imgMotorsOff;
      this._switch.active = false;
    } else if (val == 1) {
      this.find('.tc-motorsonoff-feedback').src = imgMotorsOn;
      this.imgInit = imgMotorsOn;
      this._switch.active = true;
    }
  }

  async cbSwitch(onoff) {
    try {
      if (onoff == 'on') {
        await RWS.Controller.setMotorsState('motors_on'); //Turn on the motors
      } else {
        await RWS.Controller.setMotorsState('motors_off'); //Turn off the motors
      }
    } catch (e) {
      Popup_A.error(e);
    }
  }

  async cbOpModeStateChanged(state) {
    this.enabled = state === API.CONTROLLER.OPMODE.Auto ? true : false;
  }
}

MotorsOnOff_A.loadCssClassFromString(/*css*/ `

.tc-varincrdecr-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  min-width: fit-content;
}

`);
