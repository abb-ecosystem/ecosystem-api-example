define(['views/signal'], function (Signal) {
  return class SignalContainer {
    constructor(container, signals) {
      this.container = container
      this._parentElement = container
      this._errorMessage = 'No signals found 😆!'
      this._message = ''
      this._signalsData = signals
      this.signalComponents = []

      this.init()
    }

    init() {
      this.render()
    }

    set signals(signals) {
      signals.forEach((signal, idx) => {
        this.signalComponents[idx].value = signal
      })
    }

    render() {
      this.container.innerHTML = SignalContainer.markup(this)
      this._signals = this.container.querySelectorAll('.signal')
      this._signals.forEach((signal) =>
        this.signalComponents.push(
          new Signal(signal, this._signalsData[signal.dataset.index])
        )
      )
    }

    renderSignals() {
      return this._signalsData
        .map((signal, index) => {
          return this.renderSignal(index)
        })
        .join('')
    }

    renderSignal(i) {
      let signal_markup

      if (this._signals) {
        const signal = find(
          this._signals,
          (signal) => Number(signal.dataset.index) === i
        )
        signal_markup = `<div class="signal" data-ref="${signal.dataset.ref}" data-index="${i}"></div>`
      } else {
        signal_markup = `
      <div class="signal" data-index="${i}"></div>
    `
      }
      return signal_markup
    }

    static markup(signalContainer) {
      return `
    <div class="row">
      <div class="col-1">
          ${signalContainer.renderSignals()}
       </div>
    </div>
    `
    }

    updateSignalAttributes(attr) {
      const signal = this.signalComponents.find((signal) => {
        let signalName = signal.id.slice(7)
        return signalName === attr.Name
      })
      signal && signal.updateAttributes(attr)
    }
  }
})
