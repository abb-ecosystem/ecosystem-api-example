'use strict';
// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  const imgStop = 't-components/img/png/stop.png';

  if (!o.hasOwnProperty('RapidStartStop_A')) {
    /**
     * Called when an instance of this component is created.
     * @class TComponents.RapidStartStop_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} parent - DOM element in which this component is to be inserted
     * @example
     * const btnStart = new TComponents.RapidStartStop_A(document.querySelector('.btn-start')),
     */
    o.RapidStartStop_A = class RapidStartStop extends TComponents.Component_A {
      constructor(parent) {
        super(parent);
        this.imgStop = 't-components/img/png/stop.png';
        this.imgStart = 't-components/img/png/start.png';
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        // subscribe to executionState
        try {
          var executionState = RWS.Rapid.getMonitor('execution');
          executionState.addCallbackOnChanged((eventData) => {
            if (eventData == 'stopped') {
              this.find('.tc-rapid-feedback').src = this.imgStop;
              this.child.btnStart.enabled = true;
              this.child.btnStop.enabled = false;
            } else if (eventData == 'running') {
              this.find('.tc-rapid-feedback').src = this.imgStart;
              this.child.btnStart.enabled = false;
              this.child.btnStop.enabled = true;
            }
          });
          var rapidstate = await RWS.Rapid.getExecutionState();
          console.log(rapidstate);
          executionState.subscribe(true);
        } catch (e) {
          TComponents.Popup_A.danger('Subscribe to failed. >>>', [e.message, e.description]);
        }
      }

      mapComponents() {
        return {
          btnStart: new TComponents.Button_A(
            this.find('.tc-btn-start'),
            this.cbStart.bind(this),
            'Start'
          ),
          btnStop: new TComponents.Button_A(
            this.find('.tc-btn-stop'),
            this.cbStop.bind(this),
            'Stop'
          ),
        };
      }

      onRender() {}

      markup({ imgStop }) {
        return `

          <div class="tc-container-row tc-item">
            <img src="${imgStop}" style="width:36px ;height:36px;" class="tc-rapid-feedback tc-item"> </img>
            <div class="tc-btn-start tc-item"></div>
            <div class="tc-btn-stop tc-item"></div>
          </div>

          `;
      }

      async cbStart() {
        try {
          await RWS.Rapid.resetPP(); //Sets the Program Pointer to main
          await RWS.Controller.setMotorsState('motors_on'); //Turns the motors on

          //await API.RAPID.Task._startExecution();

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
          TComponents.Popup_A.error(e);
        }
      }

      async cbStop() {
        try {
          await RWS.Rapid.stopExecution({
            stopMode: 'stop', //You can stop cycles, instructions or programs, in this case putting 'stop' we stop the program.
            useTSP: 'normal', //With 'normal' we only stop the normal tasks, not the static ones.
          });
        } catch (e) {
          TComponents.Popup_A.error(e);
        }
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
