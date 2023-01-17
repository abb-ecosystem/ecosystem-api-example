class Procedure extends TComponents.Component_A {
  /**
   * @brief Called when an instance of this component is created.
   *
   * @param {HTMLElement} container - DOM element in which this component is to be inserted
   */
  constructor(parent, module = null) {
    super(parent);
  }

  async onInit() {
    this.task = await API.RAPID.getTask();

    this.checkboxIsSR = new FPComponents.Checkbox_A();
    this._isSR = false;

    this.checkboxIsSR.desc = 'run as service routine';
    this.checkboxIsSR.onclick = this.cbIsSR.bind(this);
  }

  mapComponents() {
    return {
      module: new Module(this.find('.module-container'), modulePath, moduleName),
      modSelector: new TComponents.SelectorModules_A(
        this.find('.module-dropdown'),
        false,
        '',
        'Select a module:'
      ),
      procSelector: new TComponents.SelectorProcedures_A(
        this.find('.proc-dropdown'),
        null,
        false,
        '',
        'Select a procedure:'
      ),
      btnProcedure: new TComponents.ButtonProcedure_A(
        this.find('.exe-btn'),
        '',
        this._isSR,
        'Execute'
      ),
    };
  }

  async onRender() {
    this.child.modSelector.onSelection(this.cbOnSelectionModule.bind(this));
    this.child.procSelector.onSelection(this.cbOnSelectionProcedure.bind(this));
    this.checkboxIsSR.attachToElement(this.find('.cb-btn'));
  }

  markup() {
    return `
    <div class="tc-container">
        <div class="module-container"></div>
        <div class="tc-infobox">
          <div><p>Calling a Rapid procedure</p></div>
          <p>Please select a procedure and press execute button to call it.</p>
        </div>
        <h4>Procedures:</h4>
        <div class="tc-container-row">
          <div class="module-dropdown tc-item"></div>
          <div class="proc-dropdown tc-item"></div>
          <div class="exe-btn tc-item"></div>
          <div class="cb-btn tc-item"></div>
        </div>
      </div>
    </div>
    `;
  }

  cbIsSR(checked) {
    this.child.btnProcedure.userLevel = checked;
  }

  async cbOnSelectionModule(selection) {
    await this.child.procSelector.updateSearch(selection);
    this.child.btnProcedure.procedure = this.child.procSelector.selected;
  }

  cbOnSelectionProcedure(selection) {
    this.child.btnProcedure.procedure = selection;
  }
}
