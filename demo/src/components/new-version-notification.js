import { html, css, LitElement } from 'lit-element';
import '@dreamworld/dw-surface';
import '@dreamworld/dw-button';


export class NewVersionNotification extends LitElement {
  static get styles() {
    return css`
      :host {
        display: none;
      }

      :host([type]) {
        display: block;
      }

      :host([type="non-blocking"]) dw-surface {
        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);

        background-color: #000000DE;
        color: #fff;
      }

      :host([type="non-blocking"]) .content {
        height: 48px;
        display: flex;
        align-items: center;
      }

      :host([type="non-blocking"]) .message {
        white-space: nowrap;
      }

      :host([type="non-blocking"]) .content > * {
        margin-left: 8px;
        margin-right: 8px;
      }

      :host([type="non-blocking"]) .content > *:first-child {
        margin-left: 24px;
      }

      :host([type="non-blocking"]) .content > *:last-child {
        margin-right: 24px;
      }
    `;
  }

  static get properties() {
    return {
      releases: { type: Array },
      /**
       * Possible values: `non-blocking`, `blocking`, `full-screen`.
       */
      type: { type: String, reflect: true }
    };
  }

  constructor() {
    super();
    this.notificationType = null;
    this.releases = [];
  }

  render() {
    if (this.type === 'non-blocking') {
      return html`
        <dw-surface .elevation='${24}'>
          <div class="content">
            <div class="message">Updates are ready to be installed!</div>
            <dw-button label="INSTALL" @click="${this._install}"></dw-button>
            <dw-button label="NOT NOW" @click="${this.hide}"></dw-button>
          </div>
        </dw-surface>
      `;
    }

    if (this.type === 'blocking') {
      return html`
        <h3>BLocking view</h3>
      `;
    }
    return html``;
  }

  _install() {
    this.hide();
    if(this._confirmResolve) {
      this._confirmResolve();
      this._confirm = undefined;
      this._confirmResolve = undefined;
    }
  }

  _waitForConfirmation() {
    if (this._confirm) {
      return this._confirm;
    }

    this._confirm = new Promise((resolve) => {
      this._confirmResolve = resolve;
    });

    return this._confirm;
  }

  show(notificationType = "non-blocking", releases) {
    this.type = notificationType;
    this.releases = releases;
    return this._waitForConfirmation();
  }

  hide() {
    this.type = null;
    this.releases = [];
  }

}

window.customElements.define('new-version-notification', NewVersionNotification);
