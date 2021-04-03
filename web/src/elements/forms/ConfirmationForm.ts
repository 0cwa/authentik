import { gettext } from "django";
import { customElement, html, property, TemplateResult } from "lit-element";
import { EVENT_REFRESH } from "../../constants";
import { ModalButton } from "../buttons/ModalButton";
import "../buttons/SpinnerButton";
import { MessageLevel } from "../messages/Message";
import { showMessage } from "../messages/MessageContainer";

@customElement("ak-forms-confirm")
export class ConfirmationForm extends ModalButton {

    @property()
    successMessage!: string;
    @property()
    errorMessage!: string;

    @property()
    action!: string;

    @property({attribute: false})
    onConfirm!: () => Promise<unknown>;

    confirm(): void {
        this.onConfirm().then(() => {
            this.onSuccess();
            this.open = false;
            this.dispatchEvent(
                new CustomEvent(EVENT_REFRESH, {
                    bubbles: true,
                    composed: true,
                })
            );
        }).catch((e) => {
            this.onError(e);
        });
    }

    onSuccess(): void {
        showMessage({
            message: gettext(this.successMessage),
            level: MessageLevel.success,
        });
    }

    onError(e: Error): void {
        showMessage({
            message: gettext(`${this.errorMessage}: ${e.toString()}`),
            level: MessageLevel.error,
        });
    }

    renderModalInner(): TemplateResult {
        return html`<section class="pf-c-page__main-section pf-m-light">
            <div class="pf-c-content">
                <h1 class="pf-c-title pf-m-2xl">
                    <slot name="header"></slot>
                </h1>
            </div>
        </section>
        <section class="pf-c-page__main-section">
            <div class="pf-l-stack">
                <div class="pf-l-stack__item">
                    <div class="pf-c-card">
                        <div class="pf-c-card__body">
                            <form class="pf-c-form pf-m-horizontal">
                                <slot name="body"></slot>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <footer class="pf-c-modal-box__footer">
            <ak-spinner-button
                .callAction=${() => {
                    this.confirm();
                }}
                class="pf-m-danger">
                ${gettext(this.action)}
            </ak-spinner-button>&nbsp;
            <ak-spinner-button
                .callAction=${() => {
                    this.open = false;
                }}
                class="pf-m-secondary">
                ${gettext("Cancel")}
            </ak-spinner-button>
        </footer>`;
    }

}
