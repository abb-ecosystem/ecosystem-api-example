const moduleName = 'Ecosystem_BASE'
const modulePath = `HOME/WebApps/EcosystemGuide/rapid/${moduleName}.sysx`

define(['views/configView', 'views/ioView', 'views/motionView'], function (
  ConfigView,
  IoView,
  MotionView
) {
  return class App {
    constructor(container) {
      this.container = container
      this.init()
    }

    init() {
      this.tabContainer = new FPComponents.Tabcontainer_A()
      this.render()
    }

    render() {
      this.container.innerHTML = App.markup(this)

      this.configView = new ConfigView(
        this.container.querySelector('#cfg-view')
      )
      this.ioView = new IoView(this.container.querySelector('#io-view'))

      this.motionView = new MotionView(
        this.container.querySelector('#motion-view')
      )

      this.tabContainer.addTab('Motion', 'motion-view')
      this.tabContainer.addTab('Configuration', 'cfg-view')
      this.tabContainer.addTab('Digital IOs', 'io-view')
      this.tabContainer.addTab('About', 'about-view')
      this.tabContainer.attachToId('tab-container')
    }

    static markup() {
      return `
    <div id="tab-container"></div>
    <div id="motion-view"></div>
    <div id="cfg-view"></div>
    <div id="io-view"></div>
    <div id="about-view">
      <p>ABB Ecosystem Guidelines V1.0.18</p>
    </div>
    `
    }
  }
})
