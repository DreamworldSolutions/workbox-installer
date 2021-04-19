import { html, css, LitElement } from 'lit-element';
import { ThemeStyle } from '@dreamworld/material-styles/theme.js';
import * as TypographyLiterals from '@dreamworld/material-styles/typography-literals';
import {installWithNotification, installWithoutNotification} from './install-sw.js';

export class DemoApp extends LitElement {
  static get styles() {
    return [
      ThemeStyle,
      css`
      :host {
        --mdc-theme-primary-on-light: #00BCD4;
        --mdc-theme-secondary-on-light: #FF4081;
        display: block;
        color: var(--mdc-theme-text-primary);
        height: 100vh;
        ${TypographyLiterals.fontStyle};
      }
      `
    ];
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
      <new-version-notification></new-version-notification>
    `;
  }

  get elNewVersionNotification() {
    return this.renderRoot.querySelector('new-version-notification');
  }

  load1() {
    import('./script1.js');
  }

  load2() {
    import('./script2.js');
  }

  firstUpdated() {
    installWithNotification(this.elNewVersionNotification);
  }
}


window.customElements.define('demo-app', DemoApp);
