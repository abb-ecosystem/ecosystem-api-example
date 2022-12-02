class Variable extends TComponents.Component_A {
  /**
   * @brief Called when an instance of this component is created.
   *
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   */
  constructor(container, module = null) {
    super(container);
    this._module = module;
    this._ecNumberName = 'esNumber';
  }

  async onInit() {
    try {
      this.task = await API.RAPID.getTask();
    } catch (e) {
      TComponents.Popup_A.danger('Variable view', [e.message, e.description]);
    }
  }

  mapComponents() {
    return {
      varCtrl: new TComponents.VarInput_A(
        this.find('.var-ctrl'),
        this._module,
        this._ecNumberName,
        this._ecNumberName
      ),
      varInd: new TComponents.VarIndicator_A(
        this.find('.var-ind'),
        this._module,
        this._ecNumberName,
        this._ecNumberName
      ),
      varIncrDecrInd: new TComponents.VarIncrDecr_A(
        this.find('.var-incr-decr-ind'),
        this._module,
        this._ecNumberName,
        false
      ),
      varIncrDecrCtrl: new TComponents.VarIncrDecr_A(
        this.find('.var-incr-decr-ctrl'),
        this._module,
        this._ecNumberName
      ),
      toggleBtn: new TComponents.Button_A(
        this.find('.toggle-view'),
        () => {
          this.child.varIncrDecrCtrl.toggle();
          this.child.varIncrDecrInd.toggle();
          this.child.varCtrl.toggle();
          this.child.varInd.toggle();
          this.child.toggleBtn.text =
            this.child.toggleBtn.text === 'hide'
              ? (this.child.toggleBtn.text = 'show')
              : (this.child.toggleBtn.text = 'hide');
        },
        'hide'
      ),
      stepsSelector: new TComponents.Dropdown_A(
        this.find('.steps-selector'),
        [1, 5, 10, 50, 100],
        1,
        'steps'
      ),
      selector: new TComponents.SelectorVariables_A(this.find('.dd-menu'), this._module),
      getBtn: new TComponents.Button_A(
        this.find('.get-btn'),
        this.cbOnClick.bind(this),
        'Get value'
      ),
    };
  }

  onRender() {
    this.swUseContainer = new FPComponents.Switch_A();
    this.swUseContainer.active = false;
    this.swUseContainer.desc = 'use border';
    this.swUseContainer.onchange = (value) => {
      if (value) {
        this.child.varInd.useIndicatorBorder();
        this.child.varIncrDecrInd.cssContainer();
        this.child.varIncrDecrCtrl.css({
          border: '3px double',
          margin: '5px',
        });
      } else {
        this.child.varInd.useIndicatorBorder(false);
        this.child.varIncrDecrInd.cssContainer(false);
        this.child.varIncrDecrCtrl.css('');
      }
    };
    this.swUseContainer.attachToElement(this.find('.use-border'));

    const cbEnable = (value) => {
      this.child.varIncrDecrCtrl.enabled = value;
      this.child.varIncrDecrInd.enabled = value;
      this.child.varInd.enabled = value;
      this.child.varCtrl.enabled = value;
    };
    // setTimeout(cbEnable.bind(this, false), 500);

    this.enComp = new FPComponents.Switch_A();
    this.enComp.active = false;
    this.enComp.desc = 'enable';
    this.enComp.onchange = cbEnable;
    this.enComp.attachToElement(this.find('.en-view'));
    this.enComp.active = true;

    // Section: Getting a Rapid variable value
    this.child.stepsSelector.onSelection((value) => {
      this.child.varIncrDecrInd.steps = value;
      this.child.varIncrDecrCtrl.steps = value;
    });

    this.child.selector.onSelection(this.cbOnSelection.bind(this));

    this.showVar = this.find('.show-var');
  }

  markup() {
    return `
    <div class="tc-container">
      <div class="tc-row">
        <div class="tc-cols-1 tc-infobox">
          <div><p> Subscription to variables</p></div> 
          <div class="tc-row">
            <div class="tc-cols-2 ">
              <div class="tc-row">
                <div class="tc-cols-2 ">
                  <div class="tc-container-row">      
                    <div class="tc-item box"> 
                      <div class="var-ind center"></div>
                      <div class="var-ctrl center"></div>
                      <div class="var-incr-decr-ind center"></div>
                      <div class="var-incr-decr-ctrl center"></div>
                    </div>
                  </div>
                </div>  
                <div class="tc-cols-2 ">
                  
                </div>
              </div>
            </div>
            <div class="tc-cols-2 ">
              <div>
                <div class="tc-container-row">      
                  <div class="tc-item box"> 
                    <div class="use-border tc-item"></div>     
                    <div class="en-view tc-item"></div> 
                    <div class="toggle-view tc-item"></div>
                    <div class="steps-selector tc-item"></div>
                  </div>
                </div>
              </div>              
            </div>
          </div>
        </div>
      </div>
      <div class="tc-row">
        <div class="tc-cols-1 tc-infobox">
          <div><p>Getting a Rapid variable value</p></div>
          <p>Please select a varialbe and press the button to get its value.</p>
          <h4>Variables:</h4>
          <div class="tc-container-row">
            <div class="dd-menu tc-item"></div>
            <div class="get-btn tc-item"></div>
          </div>
          <div class="show-var"></div>
        </div>
      </div>  
    </div>
    `;
  }

  async cbOnClick() {
    this._variable = await this.task.getValue(this._module, this.child.selector.selected);

    this.showVar.innerHTML = '';
    this.showVar.appendChild(this.generateTable(this._variable));
  }

  async cbOnSelection(selection) {
    this._variable = await this.task.getValue(this._module, selection);
  }

  generateTable(obj) {
    const tbl = document.createElement('table');
    const tblBody = document.createElement('tbody');

    if (typeof obj !== 'object') {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      const cellContent = document.createTextNode(`${obj}`);
      cell.appendChild(cellContent);
      row.appendChild(cell);
      tblBody.appendChild(row);
    } else {
      for (const [key, val] of Object.entries(obj)) {
        const row = document.createElement('tr');
        const cellKey = document.createElement('td');
        cellKey.style.textAlign = 'left';
        cellKey.style.verticalAlign = 'top';
        const cellKeyContent = document.createTextNode(`${key} :`);
        cellKey.appendChild(cellKeyContent);
        row.appendChild(cellKey);

        const cellValue = document.createElement('td');
        let cellValueContent;
        if (typeof val === 'object') {
          cellValueContent = this.generateTable(val);
        } else {
          cellValueContent = document.createTextNode(`${val}`);
        }
        cellValue.appendChild(cellValueContent);
        row.appendChild(cellValue);

        row.style.borderBottom = '1px solid #ddd';
        tblBody.appendChild(row);
      }
    }
    tbl.appendChild(tblBody);
    tbl.style.fontSize = '0.8rem';
    return tbl;
  }
}
