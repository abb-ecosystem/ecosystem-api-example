'use strict';
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('MotorsOnOff_A')) {
    /**
     * Called when an instance of this component is created.
     * @class TComponents.MotorsOnOff_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @example
     * const switchMotors = new TComponents.MotorsOnOff_A(document.querySelector('.switch-motors')),
     */
    o.MotorsOnOff_A = class MotorsOnOff extends TComponents.Component_A {
      constructor(container, label = '') {
        super(container, label);
        this.imgOn = 't-components/img/png/motorsonblue.png';
        this.imgOff = 't-components/img/png/motorsoff.png';
        this.imgInit = 't-components/img/png/motorsonblue.png';
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        var execution = await RWS.IO.getSignal('scDriveEnableFeedback');

        await API.CONTROLLER.monitorOperationMode(this.cbOpModeStateChanged.bind(this));

        // check for initial state
        if ((await execution.getValue()) == 0) {
          this.imgInit = this.imgOff;
        } else {
          this.imgInit = this.imgOn;
        }

        // subscriber for motors on
        execution.addCallbackOnChanged((newValue) => {
          this.setIcon(newValue);
        });
        await execution.subscribe();
      }

      mapComponents() {
        return {};
      }

      onRender() {
        this.enComp = new FPComponents.Switch_A();
        if (this.imgInit == this.imgOff) this.enComp.active = false;
        else this.enComp.active = true;
        this.enComp.desc = 'Enable';
        this.enComp.onchange = (value) => {
          value ? this.cbSwitch('on') : this.cbSwitch('off');
        };
        this.enComp.attachToElement(this.find('.fpcomponent-switch'));
        this.find('.tc-motorsonoff-feedback').src = this.imgInit;

        this.enabled = API.CONTROLLER.isAuto;
      }

      markup({}) {
        return `

        <div class="tc-container-row tc-item">
          <img src='assets/img/motorsoff.png' style="width:36px ;height:36px;" class="tc-motorsonoff-feedback tc-item"> </img>
          <div class="fpcomponent-switch tc-item"></div>
        </div>

        `;
      }

      async setIcon(val) {
        if (val == 0) {
          this.find('.tc-motorsonoff-feedback').src = this.imgOff;
          this.imgInit = this.imgOff;
          this.enComp.active = false;
        } else if (val == 1) {
          this.find('.tc-motorsonoff-feedback').src = this.imgOn;
          this.imgInit = this.imgOn;
          this.enComp.active = true;
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
          TComponents.Popup_A.error(e);
        }
      }

      async cbOpModeStateChanged(state) {
        this.enabled = state === API.CONTROLLER.OPMODE.Auto ? true : false;
      }
    };
  }
})(TComponents);

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
