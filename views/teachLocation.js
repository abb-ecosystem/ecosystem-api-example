define(['views/popup'], function (Popup) {
  return class TeachLocation {
    constructor(container, name, location, module) {
      this.container = container
      this._name = name
      this._location = location
      this._module = module
      this.robTarget = null

      this._btnTeach = new FPComponents.Button_A()
      this._btnMove = new FPComponents.Button_A()

      this._isJogging = false

      this.init()
    }

    async init() {
      const task = await API.RAPID.getTask()
      try {
        const task = await API.RAPID.getTask()
        this.robTarget = await task.getVariable(this._module, this._location)
      } catch (e) {
        Popup.error(e)
      }

      this._btnTeach.text = 'Teach'
      this._btnMove.text = 'Move to'

      this._btnTeach.onclick = this.teach.bind(this)

      this.render()
    }

    render() {
      this.container.innerHTML = TeachLocation.markup(this)

      this._btnTeach.attachToElement(this.container.querySelector('.btn-teach'))

      const elemMove = this.container.querySelector('.btn-move')
      this._btnMove.attachToElement(elemMove)

      // adding aditional event listener to the move button
      const elemBtnMove = elemMove.querySelector('.fp-components-button')
      elemBtnMove.addEventListener('pointerdown', this.move.bind(this))
      elemBtnMove.addEventListener('pointerup', this.stop.bind(this))
      elemBtnMove.addEventListener('pointerleave', this.stop.bind(this))
    }

    static markup({ _location, _name }) {
      return `
      <div id="${_location}" class="location location-row">
      <div class="btn-teach output"></div>
      <div class="btn-move output"></div>
      <p>${_name}</p>
    </div>
    `
    }

    async teach() {
      try {
        this.robTarget = await API.MOTION.getRobotPosition()
        const task = await API.RAPID.getTask()
        await task.setVariable(this._module, this._location, this.robTarget)
      } catch (e) {
        Popup.error(e)
      }
    }

    async move() {
      const jogData = [500, 500, 500, 500, 500, 500]
      if (!this.robTarget) return

      try {
        this._isJogging = true
        await API.MOTION.executeJogging(
          '',
          '',
          '',
          API.MOTION.JOGMODE.GoToPos,
          jogData,
          this.robTarget
        )
      } catch (e) {
        this._isJogging = false
        Popup.error(e)
      }
    }

    async stop() {
      if (this._isJogging) {
        try {
          await API.MOTION.stopJogging()
        } catch (e) {
          Popup.error(e)
        }
        this._isJogging = false
      }
    }
  }
})
