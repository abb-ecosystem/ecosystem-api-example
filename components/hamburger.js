/**
 * @brief Hamburger menu componet
 *
 */
class Hamburger extends TComponents.Component_A {
  /**
   * @brief
   * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
   * @param {string} title
   * @param {boolean} alwaysVisible
   */
  constructor(container, title, alwaysVisible = true) {
    super(container);
    this.viewId = new Map();

    this.hamburgerMenu = new FPComponents.Hamburgermenu_A();
    this.hamburgerMenu.title = title;
    this.hamburgerMenu.alwaysVisible = alwaysVisible;
  }

  onInit() {
    // const updateHamburgerView = function (oldView, newView) {
    //   if (viewId.get(newView) === 'Variables') {
    //     // do something...
    //   }
    // }
    // this.hamburgerMenu.onchange = updateHamburgerView
  }

  onRender() {
    this.hamburgerMenu.attachToElement(this.container);

    this.find('.fp-components-hamburgermenu-a-menu__container').style.setProperty('z-index', '1');
    this.find('.fp-components-hamburgermenu-a-button-container').style.setProperty('z-index', '1');
    this.find('.fp-components-hamburgermenu-a-container__content').style.setProperty(
      'overflow',
      'visible'
    );

    const baseEl = this.container.querySelector('.fp-components-base');
    baseEl.classList.remove('fp-components-base');
  }

  addView(name, content, image, active = false) {
    this.viewId.set(this.hamburgerMenu.addView(name, content, image, active), name);
  }
}

var hamburgerStyle = document.createElement('style');
hamburgerStyle.innerHTML = `

.hamburger-base-style {
  background-color: transparent !important;
}
  `;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(hamburgerStyle, ref);
