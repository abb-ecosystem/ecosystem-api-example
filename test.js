class Test extends TComponents.Component_A {
  constructor(parent, name = '') {
    super(parent);
    this.name = name;
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    this.container.innerHTML = this.markup(this);

    // this.comp1 = new TComponentsView(this.container.querySelector('.comp-1'));
    this.comp1 = new TComponents.TemplateView_A(this.container.querySelector('.comp-1'), 'Comp1');
    this.comp1.render();
    this.comp2 = new TComponents.TemplateView_A(this.container.querySelector('.comp-1'), 'Comp2');
    this.comp2.render();
    this.comp3 = new TComponents.TemplateView_A(this.container.querySelector('.comp-1'), 'Comp3');
    this.comp3.render();
    this.comp4 = new TComponents.TemplateView_A(this.container.querySelector('.comp-1'), 'Comp4');
    this.comp4.render();

    const cbOnClick = () => {
      console.log('callback called...');
    };

    this.comp1.onClick(cbOnClick);
    this.comp1.onClick(cbOnClick);

    setTimeout(async () => {
      await this.comp1.render();
      this.comp1.onClick(cbOnClick);
      await this.comp1.render();
      this.comp1.onClick(cbOnClick);

      await this.comp4.render();
      await this.comp4.render();
      await this.comp4.render();

      this.comp1.attachToElement(this.container.querySelector('.comp-2'));
    });
  }

  markup({ name }) {
    return `
    <div class="row comp-text">${name}</div>
    <div class="comp-1"/>
    <div class="comp-2"/>
    `;
  }
}
