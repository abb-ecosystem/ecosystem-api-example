export default class Module extends TComponents.Component_A {
  constructor(parent, path, name, isSysmodule = true) {
    super(parent, { options: { async: false } });
    this.path = path.replace(/\:$/, '');
    this.name = name;
    this.extension = isSysmodule ? '.sysx' : '.modx';

    this.btnLoadModule = new FPComponents.Button_A();
    this.btnUnloadModule = new FPComponents.Button_A();
  }

  async onInit() {
    try {
      const task = await API.RAPID.getTask();
      const modules = await task.searchModules();

      this.btnLoadModule.onclick = this.load.bind(this);
      this.btnUnloadModule.onclick = this.unload.bind(this);
    } catch (e) {
      this.error = true;
    }
  }

  onRender() {
    this.btnLoadModule.text = 'Load Module';
    this.btnUnloadModule.text = 'Unload Module';

    this.btnLoadModule.attachToElement(this.find('.load-module'));
    this.btnUnloadModule.attachToElement(this.find('.unload-module'));
  }

  markup() {
    return /*html*/ `
      <p>
        Modules can be dynamically loaded and unloaded by a WebApp from a file. Click on the
        following buttons to load/unload the "Ecosysten_BASE" module.
      </p>
      <div class="tc-container-row">
        <div class="load-module tc-item"></div>
        <div class="unload-module tc-item"></div>
      </div>
  `;

    // return /*html*/ `
    //   <div class="tc-infobox">
    //     <div><p>Load/unload a module</p></div>
    //     <p>
    //       Modules can be dynamically loaded and unloaded by a WebApp from a file. Click on the
    //       following buttons to load/unload the "Ecosysten_BASE" module.
    //     </p>
    //     <div class="tc-container-row">
    //       <div class="load-module tc-item"></div>
    //       <div class="unload-module tc-item"></div>
    //     </div>
    //   </div>
    // `;
  }

  async load() {
    try {
      let url = `${this.path}/${this.name}${this.extension}`;
      await API.RAPID.loadModule(url, true);
    } catch (e) {
      TComponents.Popup_A.error(e);
      // console.error('Uncaught exception in cbOnClickLoad: ' + JSON.stringify(e))
      // console.error(e)
    }
  }

  async unload() {
    try {
      await API.RAPID.unloadModule(this.name);
    } catch (e) {
      TComponents.Popup_A.error(e, 'Excpetion in Module.unload(): ');
      console.error(e);
    }
  }
}
