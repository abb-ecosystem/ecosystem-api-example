define(function () {
  return class Reboot {
    constructor(container) {
      this.container = container
      this.btnReboot = new FPComponents.Button_A()

      this.init()
    }

    init() {
      this.btnReboot.text = 'Reboot'
      this.btnReboot.onclick = this.reboot.bind(this)
      this.btnReboot.highlight = true

      this.render()
    }

    render() {
      this.container.innerHTML = Reboot.markup(this)
      this.btnReboot.attachToElement(
        this.container.querySelector('.btn-reboot')
      )
    }

    static markup() {
      return `
    <div class="row">
      <div class="btn-reboot hidden"></div>
    </div>
    `
    }

    reboot() {
      RWS.Controller.restartController(RWS.Controller.RestartModes.restart)
    }

    hide() {
      console.log('Reboot.hide called...')
      this.container.querySelector('.btn-reboot').classList.add('hidden')
    }

    show() {
      console.log('Reboot.show called...')
      this.container.querySelector('.btn-reboot').classList.remove('hidden')
    }
  }
})
