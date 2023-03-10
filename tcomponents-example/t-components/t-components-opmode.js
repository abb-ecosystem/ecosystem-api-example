'use strict';

import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';
import { imgOpModeAuto, imgOpModeMan } from './img/images.js';

/**
 * Called when an instance of this component is created.
 * @class TComponents.OpMode_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @example
 * // index.html
 * ...
 * &lt;div class="radio-opmode"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const opMode = new OpMode_A(document.querySelector('.radio-opmode'));
 * await opMode.render();
 */
export class OpMode_A extends Component_A {
  constructor(parent) {
    super(parent);
    this.radioMan = new FPComponents.Radio_A();
    this.radioAuto = new FPComponents.Radio_A();
    this.radioMan.onclick = this.cbOpModeMan.bind(this);
    this.radioAuto.onclick = this.cbOpModeAuto.bind(this);
    this.radioAuto.desc = 'Automatic';
    this.radioMan.desc = 'Manual';
  }

  async onInit() {
    try {
      this.initOpMode = await RWS.Controller.getOperationMode();
      const opModeSub = RWS.Controller.getMonitor('operation-mode');
      opModeSub.addCallbackOnChanged(this.OpModeChanged.bind(this));
      await opModeSub.subscribe();
    } catch (e) {
      this.error = true;
      Popup_A.error(e, `TComponents.OpMode_A`);
    }
  }

  onRender() {
    this.radioMan.attachToElement(this.find('.sc-radio-1'));
    this.radioAuto.attachToElement(this.find('.sc-radio-2'));

    this.OpModeChanged(this.initOpMode);
  }

  markup({}) {
    return `

          <div class="tc-container-row tc-item">
            <img src=${imgOpModeMan} style="width:36px ;height:36px;" class="tc-opmode-feedback tc-item"> </img>
            <div class="sc-radio-1 tc-item"></div>
            <div class="sc-radio-2 tc-item"></div>
          </div>

          `;
  }

  async OpModeChanged(mode) {
    if (mode == 'automatic') {
      this.radioMan.checked = false;
      this.radioAuto.checked = true;
      this.find('.tc-opmode-feedback').src = imgOpModeAuto;
    } else if (mode == 'manual_reduced') {
      this.radioMan.checked = true;
      this.radioAuto.checked = false;
      this.find('.tc-opmode-feedback').src = imgOpModeMan;
    }
  }

  async cbOpModeAuto() {
    this.radioMan.checked = false;
    await RWS.Controller.setOperationMode('automatic'); //Sets controller to automatic mode
  }

  async cbOpModeMan() {
    this.radioAuto.checked = false;
    await RWS.Controller.setOperationMode('manual'); //Sets controller to manual mode
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
