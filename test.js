class Test extends TComponents.Component_A {
  constructor(container, name = '') {
    super(container);
    this.name = name;
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    this.container.innerHTML = this.markup(this);

    this.comp1 = new TComponentsView(this.container.querySelector('.comp-1'));
    this.comp1.render();
  }

  markup({ name }) {
    return `
    <div class="row comp-text">${name}</div>
    <div class="comp-1"></div>
    `;
  }
}
