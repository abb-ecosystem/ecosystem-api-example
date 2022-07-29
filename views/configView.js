// const moduleName = 'Ecosystem_BASE'
// const modulePath = `HOME/WebApps/EcosystemGuide/rapid/${moduleName}.sysx`

define([
  'views/crossConnection',
  'views/module',
  'views/logicSignal',
], function (CrossConnection, Module, LogicSignal) {
  return class ConfigView {
    constructor(container) {
      this.container = container
      this.init()
    }

    init() {
      this.render()
    }

    render() {
      this.container.innerHTML = ConfigView.markup(this)

      const crossCons = new CrossConnection(
        this.container.querySelector('.cross-connections-container')
      )

      const module = new Module(
        this.container.querySelector('.module-container'),
        modulePath,
        moduleName
      )

      const virtualSignal = new LogicSignal(
        this.container.querySelector('.logic-signals-container')
      )
    }

    static markup() {
      return `
    <div class="row">
      <div class="cols-2">
        <div class="row">
          <div class="cross-connections-container"></div>
        </div>
      </div>
      <div class="cols-2">
        <div class="logic-signals-container"></div>
        <div class="module-container"></div>
        </div>
      </div>
    </div>
    `
    }
  }
})
