// class LogicSignal extends View {
define(function () {
  return class LogicSignal {
    constructor(container) {
      // super(container)
      this.container = container
      this.init()
    }

    init() {
      this.btnCreate = new FPComponents.Button_A()
      this.btnRemove = new FPComponents.Button_A()
      this.inSignalName = new FPComponents.Input_A()
      this.ddSignalType = new FPComponents.Dropdown_A()

      this.btnCreate.onclick = this.create.bind(this)
      this.btnRemove.onclick = this.remove.bind(this)

      this.btnCreate.text = 'Create'
      this.btnRemove.text = 'Remove'

      this.inSignalName.text = 'signal_name'
      this.inSignalName.desc = 'Signal to be created:'
      this.inSignalName.regex = /^\S*$/

      this.ddSignalType.model = {
        items: ['DI', 'DO', 'GO', 'GI'],
      }
      this.ddSignalType.selected = 0
      this.ddSignalType.onselection = (index, obj) => {
        console.log(index)
        console.log(obj)
      }
      this.ddSignalType.desc = 'Select signal type'

      this.render()
    }

    render() {
      this.container.innerHTML = LogicSignal.markup(this)

      this.inSignalName.attachToElement(
        this.container.querySelector('.signal-name')
      )
      this.ddSignalType.attachToElement(
        this.container.querySelector('.signal-type')
      )
      this.btnCreate.attachToElement(
        this.container.querySelector('.signal-create')
      )
      this.btnRemove.attachToElement(
        this.container.querySelector('.signal-delete')
      )
    }

    static markup() {
      return `
    <div class="row">
      <div class="col-1 infobox">
        <div><p>Logic signals</p></div>
        <div class="row">
          <div class="col-2">
            <p>Logic signals have no Device and Map assignation i.e. are 
            not assigned to any physical hardware. These signals can be used
            in RAPID exactly the same as physicla ones.</p>
            <div class="signal-name"></div>
            <div class="signal-type"></div>
            <div class="container-row">
              <div class="signal-create item"></div>
              <div class="signal-delete item"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
    }

    async remove() {
      try {
        await API.SIGNAL.deleteSignal(this.inSignalName.text)
      } catch (e) {
        console.error(e)
      }
    }

    async create() {
      try {
        let attr = {}
        attr.SignalType =
          this.ddSignalType.model.items[this.ddSignalType.selected]
        attr.Access = 'All'
        await API.SIGNAL.createSignal(this.inSignalName.text, attr)
      } catch (e) {
        console.error(
          'Uncaught exception in LogicSignal.create: ' + JSON.stringify(e)
        )
        console.error(e)
      }
    }
  }
})
