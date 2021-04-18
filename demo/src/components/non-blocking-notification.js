import { html, css, LitElement } from 'lit-element';


export class NonBlockingNotification extends LitElement {
  static get styles() {
    return css`
      :host {
        display: none;
      }

      :host([type="non-blocking"]) {
        display: block;
        position: fixed;
        height: 48px;
        background-color: #000000DE;
      }
    `;
  }

  static get properties() {
    return {
      releases: { type: Array },
      type: { type: String, reflect: true }
    };
  }

  constructor() {
    super();
  }

  render() {
    if (this.type === 'non-blocking') {
      return html`
         
      `;
    }
    return html`
      <h2>Welcome to the Workbox Installer Demo App</h2>
      <button @click="${this.load1}">load 1</button>
      <button @click="${this.load2}">load 2</button>
    `;
  }

}

window.customElements.define('non-blocking-notification', NonBlockingNotification);
