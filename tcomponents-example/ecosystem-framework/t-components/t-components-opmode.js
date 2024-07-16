import API from '../api/index.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';
import { imgOpModeAuto, imgOpModeMan } from './img/images.js';

/**
 * Called when an instance of this component is created.
 * @class TComponents.OpMode_A
 * @extends TComponents.Component_A
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
      this.initOpMode = await API.CONTROLLER.getOperationMode();
    } catch (e) {
      this.error = true;
      Popup_A.error(e, `TComponents.OpMode_A`);
    }
  }

  onRender() {
    this.radioMan.attachToElement(this.find('.sc-radio-1'));
    this.radioAuto.attachToElement(this.find('.sc-radio-2'));

    API.CONTROLLER.monitorOperationMode(this.OpModeChanged.bind(this));
  }

  markup({}) {
    return /*html*/ `

          <div class="tc-container-row tc-item">
          <img src=${
            this.initOpMode === API.CONTROLLER.OPMODE.Auto ? imgOpModeAuto : imgOpModeMan
          }  class="tc-opmode-feedback tc-item" style="width:36px ;height:36px;" >
            <div class="sc-radio-1 tc-item"></div>
            <div class="sc-radio-2 tc-item"></div>
          </div>

          `;
  }

  async OpModeChanged(mode) {
    if (mode === API.CONTROLLER.OPMODE.Auto) {
      this.radioMan.checked = false;
      this.radioAuto.checked = true;
      this.find('.tc-opmode-feedback').src = imgOpModeAuto;
    } else if (mode === API.CONTROLLER.OPMODE.ManualR) {
      this.radioMan.checked = true;
      this.radioAuto.checked = false;
      this.find('.tc-opmode-feedback').src = imgOpModeMan;
    }
  }

  async cbOpModeAuto() {
    this.radioMan.checked = false;
    API.CONTROLLER.setOpModeAutomatic();
  }

  async cbOpModeMan() {
    this.radioAuto.checked = false;
    API.CONTROLLER.setOpModeManual();
  }
}

OpMode_A.loadCssClassFromString(/*css*/ `

.tc-varincrdecr-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  min-width: fit-content;
}

`);
