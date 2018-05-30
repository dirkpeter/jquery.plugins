class wcColapsible extends HTMLElement {
  // A getter/setter for an open property.
  get open() {
    return this.hasAttribute('open');
  }


  //
  set open(val) {
    // Reflect the value of the open property as an HTML attribute.
    if (val) {
      this.setAttribute('open', '');
    }
    else {
      this.removeAttribute('open');
    }
  }


  // A getter/setter for a disabled property.
  get disabled() {
    return this.hasAttribute('disabled');
  }


  //
  set disabled(val) {
    // Reflect the value of the disabled property as an HTML attribute.
    if (val) {
      this.setAttribute('disabled', '');
    }
    else {
      this.removeAttribute('disabled');
    }
  }


  //
  set trigger(title = '') {
    const trigger = this.shadowRoot.querySelector('.trigger');

    trigger.innerHTML = title;
  }


  // Can define constructor arguments if you wish.
  constructor() {
    super();

    // get the template
    const tpl = document.querySelector('#wc-colapsible-template');

    // Attach a shadow root to the element.
    const shadowRoot = this.attachShadow({mode: 'open'});

    shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.trigger = this.title;

    // Setup a click listener on <app-drawer> itself.
    this.addEventListener('click', () => {
      // Don't toggle the drawer if it's disabled.
      if (this.disabled) {
        return;
      }
      this.toggleDrawer();
    });
  }


  //
  attributeChangedCallback(attrName, oldVal, newVal) {
    if (this.disabled) {
      this.setAttribute('tabindex', '-1');
      this.setAttribute('aria-disabled', 'true');
    }
    else {
      this.setAttribute('tabindex', '0');
      this.setAttribute('aria-disabled', 'false');
    }
  }


  //
  toggleDrawer() {
    this.open = !this.open;
  }
}

customElements.define('wc-colapsible', wcColapsible);
