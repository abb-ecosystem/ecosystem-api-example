// class CrossConnection extends View {
define(function () {
  return class CrossConnection {
    constructor(container) {
      this.container = container
      this.init()
    }

    init() {
      this.btnGetCrossConn = new FPComponents.Button_A()
      this.btnSetCrossConn = new FPComponents.Button_A()
      this.btnDeleteCrossConn = new FPComponents.Button_A()

      this.btnGetCrossConn.onclick = this.getCrossConnection.bind(this)
      this.btnSetCrossConn.onclick = this.setCrossConnection.bind(this)
      this.btnDeleteCrossConn.onclick = this.deleteCrossConnection.bind(this)

      this.btnGetCrossConn.text = 'Get cross-connections'
      this.btnSetCrossConn.text = 'Set cross-connection'
      this.btnDeleteCrossConn.text = 'Remove cross-connection'

      this.render()
    }

    render() {
      this.container.innerHTML = CrossConnection.markup(this)

      this.btnGetCrossConn.attachToElement(
        this.container.querySelector('.cross-connection-get')
      )
      this.btnSetCrossConn.attachToElement(
        this.container.querySelector('.cross-connection-set')
      )
      this.btnDeleteCrossConn.attachToElement(
        this.container.querySelector('.cross-connection-delete')
      )
    }

    static markup() {
      return `
    <div class="infobox">
      <div><p>Cross-Connections</p></div>
      <div class="cross-connection-get right"></div>
      <textarea
        name="cross-connection-output"
        id="cross-connection-output"
        cols="60"
        rows="20"
      ></textarea>
      <div class="container-row">
        <div class="cross-connection-set item"></div>
        <div class="cross-connection-delete item"></div>
      </div>
    </div>
    `
    }

    async getCrossConnection() {
      const textArea = document.getElementById('cross-connection-output')
      textArea.textContent = ''
      const crossConns = await API.SIGNAL.fetchAllCrossConnections()

      textArea.textContent = crossConns
        .map((conn) => JSON.stringify(conn.getAttributes()))
        .join(' \n ')
    }

    async setCrossConnection() {
      const attrs = {
        Name: 'newConnection',
        Res: 'ZG_DI0',
        Act1: 'ZG_DI1',
        Act1_invert: 'false',
        Oper1: 'AND',
        Act2: 'ZG_DI2',
        Act2_invert: 'false',
        // Oper2: '',
        // Act3: '',
        // Act3_invert: '',
        // Oper3: '',
        // Act4: '',
        // Act4_invert: 'false',
        // Oper4: '',
        // Act5: '',
        // Act5_invert: 'false',
      }

      try {
        await API.SIGNAL.createCrossConnectionInstance(attrs)
      } catch (e) {
        console.error(e)
      }
    }

    async deleteCrossConnection() {
      try {
        await API.SIGNAL.deleteCrossConnection('newConnection')
      } catch (e) {
        console.error(e)
      }
    }
  }
})
