'use strict';
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('OpMode_A')) {
    /**
     * Called when an instance of this component is created.
     * @class TComponents.OpMode_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @example
     * const opMode = new TComponents.OpMode_A(document.querySelector('.radio-opmode')),
     */
    o.OpMode_A = class OpMode extends TComponents.Component_A {
      constructor(container) {
        super(container);
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        (this.radioMan = new FPComponents.Radio_A()),
          (this.radioAuto = new FPComponents.Radio_A()),
          (this.radioMan.onclick = this.cbOpModeMan.bind(this));
        this.radioAuto.onclick = this.cbOpModeAuto.bind(this);

        this.radioAuto.desc = 'Automatic';
        this.radioMan.desc = 'Manual';

        this.initOpMode = await RWS.Controller.getOperationMode();

        const opModeSub = RWS.Controller.getMonitor('operation-mode');
        opModeSub.addCallbackOnChanged(this.OpModeChanged.bind(this));
        await opModeSub.subscribe();
      }

      mapComponents() {
        return {};
      }

      onRender() {
        this.radioMan.attachToElement(this.find('.sc-radio-1'));
        this.radioAuto.attachToElement(this.find('.sc-radio-2'));

        this.OpModeChanged(this.initOpMode);
      }

      markup({}) {
        return `

          <div class="tc-container-row tc-item">
            <img src="t-components/img/png/opmodeman.png" style="width:36px ;height:36px;" class="tc-opmode-feedback tc-item"> </img>
            <div class="sc-radio-1 tc-item"></div>
            <div class="sc-radio-2 tc-item"></div>
          </div>

          `;
      }

      async OpModeChanged(mode) {
        if (mode == 'automatic') {
          this.radioMan.checked = false;
          this.radioAuto.checked = true;
          this.find('.tc-opmode-feedback').src = 't-components/img/png/opmodeauto.png';
        } else if (mode == 'manual_reduced') {
          this.radioMan.checked = true;
          this.radioAuto.checked = false;
          this.find('.tc-opmode-feedback').src = 't-components/img/png/opmodeman.png';
        }
      }

      async cbOpModeAuto() {
        this.radioMan.checked = false;
        var feedback = await RWS.Controller.setOperationMode('automatic'); //Sets controller to automatic mode
      }

      async cbOpModeMan() {
        this.radioAuto.checked = false;
        var feedback = await RWS.Controller.setOperationMode('manual'); //Sets controller to manual mode
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
