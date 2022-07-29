define(function () {
  return class Module {
    constructor(container, path, name) {
      this.container = container
      this.path = path
      this.name = name
      this.init()
    }

    init() {
      this.btnLoadModule = new FPComponents.Button_A()
      this.btnUnloadModule = new FPComponents.Button_A()

      this.btnLoadModule.onclick = this.load.bind(this)
      this.btnUnloadModule.onclick = this.unload.bind(this)

      this.btnLoadModule.text = 'Load Module'
      this.btnUnloadModule.text = 'Unload Module'

      this.render()
    }

    render() {
      this.container.innerHTML = Module.markup(this)

      this.btnLoadModule.attachToElement(
        this.container.querySelector('.load-module')
      )
      this.btnUnloadModule.attachToElement(
        this.container.querySelector('.unload-module')
      )
    }

    static markup() {
      return `
    <div class="row">
      <div class="col-1 infobox">
        <div><p>Load Module</p></div>
        <div class="row">
          <div class="col-2">
          <p>Modules can be dynamically loaded and unloaded by a WebApp from a file.
          Click on the following buttons to load/unload the "Ecosysten_BASE" module.</p>
            <div class="container-row">
              <div class="load-module item"></div>
              <div class="unload-module item"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
    }

    async load() {
      try {
        console.log(`Loading ${this.path}/${this.name}`)
        await API.RAPID.loadModule(this.path, true)
      } catch (e) {
        console.error(
          'Uncaught exception in cbOnClickLoad: ' + JSON.stringify(e)
        )
        console.error(e)
      }
    }

    async unload() {
      try {
        await API.RAPID.unloadModule(this.name)
      } catch (e) {
        console.error(
          'Uncaught exception in cbOnClickUnload: ' + JSON.stringify(e)
        )
        console.error(e)
      }
    }
  }
})
