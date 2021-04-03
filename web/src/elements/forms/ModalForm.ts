import { gettext } from "django";
import { customElement, html, property, TemplateResult } from "lit-element";
import { EVENT_REFRESH } from "../../constants";
import { ModalButton } from "../buttons/ModalButton";
import { Form } from "./Form";
import "../buttons/SpinnerButton";

@customElement("ak-forms-modal")
export class ModalForm extends ModalButton {

    @property({ type: Boolean })
    closeAfterSuccessfulSubmit = true;

    confirm(): void {
        this.querySelectorAll<Form<unknown>>("[slot=form]").forEach(form => {
            const formPromise = form.submit(new Event("submit"));
            if (!formPromise) {
                return;
            }
            formPromise.then(() => {
                if (this.closeAfterSuccessfulSubmit) {
                    this.open = false;
                    form.reset();
                }
                this.dispatchEvent(
                    new CustomEvent(EVENT_REFRESH, {
                        bubbles: true,
                        composed: true,
                    })
                );
            }).catch((e) => {
                console.log(e);
            });
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
                            <slot name="form"></slot>
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
                class="pf-m-primary">
                <slot name="submit"></slot>
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
