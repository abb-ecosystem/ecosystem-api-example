define(function () {
  return class TemplateView {
    constructor(container) {
      this.container = container
      this.init()
    }

    init() {
      this.render()
    }

    render() {
      this.container.innerHTML = TemplateView.markup(this)
    }

    static markup() {
      return `
    <div class="row">Hellow World</div>
    `
    }
  }
})
