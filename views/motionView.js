// const moduleName = 'Ecosystem_BASE'
// const modulePath = `HOME/WebApps/EcosystemGuide/rapid/${moduleName}.sysx`

define(['views/teachLocation'], function (TeachLocation) {
  return class MotionView {
    constructor(container) {
      this.container = container
      this.init()
    }

    init() {
      this.render()
    }

    render() {
      this.container.innerHTML = MotionView.markup(this)

      const location01 = new TeachLocation(
        this.container.querySelector('.teach-location-container-01'),
        'Target 1',
        'esTarget01',
        'Ecosystem_BASE'
      )

      const location02 = new TeachLocation(
        this.container.querySelector('.teach-location-container-02'),
        'Target 2',
        'esTarget02',
        'Ecosystem_BASE'
      )

      const location03 = new TeachLocation(
        this.container.querySelector('.teach-location-container-03'),
        'Target 3',
        'esTarget03',
        'Ecosystem_BASE'
      )
    }

    static markup() {
      return `
    <div class="row">
      <div class="teach-location-container-01"></div>
      <div class="teach-location-container-02"></div>
      <div class="teach-location-container-03"></div>
    </div>
    `
    }
  }
})
