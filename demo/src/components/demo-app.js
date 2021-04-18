import { html, css, LitElement } from 'lit-element';
import { default as installWorkbox } from '@dreamworld/workbox-installer';

installWorkbox('/service-worker.js');

export class DemoApp extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        color: var(--demo-app-text-color, #000);
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
    };
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <h2>Welcome to the Workbox Installer Demo App</h2>
      <button @click="${this.load1}">load 1</button>
      <button @click="${this.load2}">load 2</button>
    `;
  }

  load1() {
    import('./script1.js');
  }

  load2() {
    import('./script2.js');
  }
}


window.customElements.define('demo-app', DemoApp);
