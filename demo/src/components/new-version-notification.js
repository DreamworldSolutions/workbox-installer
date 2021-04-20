import { html, css, LitElement } from 'lit-element';
import '@dreamworld/dw-surface';
import '@dreamworld/dw-button';
import '@dreamworld/dw-dialog';

export class NewVersionNotification extends LitElement {
  static get styles() {
    return css`
      :host {
        display: none;
      }

      :host([type]) {
        display: block;
      }

      :host([type=full-screen]), :host([type=blocking]) {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--mdc-theme-primary);
        color: var(--mdc-theme-on-primary);
        z-index: 100;
      }

      :host([type=blocking]) {
        background-color: var(--mdc-theme-surface);
        color: var(--mdc-theme-on-surface);
      }

      h3, h5 {
        text-align: center;
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

      :host([type="blocking"]) .dialog-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
      }

      :host([type="blocking"]) .dialog-container .header {
        font-size: 20px;
        line-height: 24px;
        font-weight: 600;
        margin: 72px 0px 20px;
      }

      :host([type="blocking"]) .dialog-container .message {
        font-size: 20px;
        line-height: 24px;
        text-align: center;
      }

      :host([type="blocking"]) .dialog-container a {
        color: gray;
      }

      :host([type="blocking"]) .dialog-container dw-button {
        margin: 32px 0px;
      }

      @media screen and (max-width: 592px) {
        :host([type="blocking"]) dw-dialog {
          --dw-dialog-border-radius: 40px 40px 0px 0px;
        }

        :host([type="blocking"]) .dialog-container {
          min-height: calc(100vh - 52px);
        }
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

    if (this.type === 'full-screen') {
      return html`
        <img src="../images/hisab-vertical.svg">
        <h3>Please Wait...</h3>
        <h5>Application is being updated</h5>
      `;
    }

    if (this.type === 'blocking') {
      return html`
        <dw-dialog opened="true" placement=${window.innerWidth > 592 ? "center" : "bottom"} fit-height=${window.innerWidth < 592 ? true : false}>
          <div>
            <div class="dialog-container" >
              <img src="../images/undraw_update_uxn2.svg">
              <div class="header">New Update Available</div>
              <div class="message">We have added some new features and fixed some bugs to make your accounting smooth. To know more about updates </div>
              <a href="$1">click here</a>
              <dw-button label="UPDATE" filled @click="${this._install}"></dw-button>
            </div>
          </div>
        </dw-dialog>
        <!-- <h3>New Version Available!</h3>
        <h5>Updates are ready to be installed!</h5>
        <div style="text-align:center;"><dw-button label="INSTALL" @click="${this._install}"></dw-button></div> -->
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

  show(notificationType = "blocking", releases) {
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
