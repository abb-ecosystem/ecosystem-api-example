const imgTray = 'assets/img/tray_w_p1-4_400x400.png';

class SettingsView extends TComponents.Component_A {
  constructor(parent, module, nrParts, rows, columns, currentPart, simMachine) {
    super(parent);
    this._module = module;
    this._nrParts = nrParts;
    this._rows = rows;
    this._columns = columns;
    this._currentPart = currentPart;
    this._simMachine = simMachine;
  }

  mapComponents() {
    return {
      numParts: new TComponents.VarIndicator_A(
        this.find('.mt-numParts'),
        this._module,
        this._nrParts
      ),
      rows: new TComponents.VarIncrDecr_A(this.find('.mt-numRows'), this._module, this._rows),
      cols: new TComponents.VarIncrDecr_A(this.find('.mt-numCols'), this._module, this._columns),
      currentPart: new TComponents.VarInput_A(
        this.find('.mt-currentPart'),
        this._module,
        this._currentPart
      ),
      simMachine: new TComponents.VarSwitch_A(
        this.find('.checkbox-sim'),
        this._module,
        this._simMachine
      ),
      btnStart: new TComponents.RapidStartStop_A(this.find('.btn-start')),

      switchMotors: new TComponents.MotorsOnOff_A(this.find('.switch-motors')),

      radioOpMode: new TComponents.OpMode_A(this.find('.radio-opmode')),
    };
  }

  markup(self) {
    return `
      <div id="settings-subview" class="tc-content">
        <div class="tc-row">
          <div class="tc-cols-1 tc-infobox">
            <div>
              <p>Machine Tending Example</p>
            </div>
          </div>

          <div class="tc-row">
            <div class="tc-cols-2">
              <div class="tc-row">
                <div class="tc-settings-view-flex-container">
                  <div class="tc-cols-1 tc-infobox">
                    <div>
                      <p>Setup</p>
                    </div>
                  </div>
                  <div class="mt-numRows"></div>
                  <div class="mt-numCols"></div>
                  <div class="tc-container-row">
                    <p class="tc-item">Number of parts on tray</p>
                    <div class="mt-numParts"></div>
                  </div>
                </div>

                <div class="tc-settings-view-flex-container">

                  <div class="tc-container-row">
                    <p class="tc-item">Current part</p>
                    <div class="mt-currentPart"></div>
                  </div>
                  <div class="tc-container-row">
                    <p class="tc-item">Simulate Machine</p>
                    <div class="checkbox-sim tc-item"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="tc-cols-2">
              <div>
                <img src="${imgTray}" alt="Tray" class="tc-settingview-img" />
              </div>
            </div>
          </div>
        </div>


        <div class="tc-row">
          <div class="tc-cols-1 tc-infobox">
           
            <div><p>BASIC CONTROL</p></div> 
            <div class="box"> 
              <div class="btn-start"></div>
              <div class="switch-motors"></div>
              <div class="radio-opmode"></div>
            </div>

        </div>
      </div>
    `;
  }
}

var tComponentStyle = document.createElement('style');
tComponentStyle.innerHTML = `

.tc-settingview-img {
  width: 350px;
  height: auto;
  padding: 0px 50px;
}

.tc-settings-view-flex-container {
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-right: 100px;
}

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);
