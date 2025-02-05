import { t } from "@lingui/macro";

import { customElement } from "lit/decorators.js";

import { Form } from "../forms/Form";
import { WizardPage } from "./WizardPage";

@customElement("ak-wizard-page-form")
export class FormWizardPage extends WizardPage {
    _isValid = true;

    isValid(): boolean {
        return this._isValid;
    }

    nextCallback = async () => {
        const form = this.querySelector<Form<unknown>>("*");
        if (!form) {
            return Promise.reject(t`No form found`);
        }
        const formPromise = form.submit(new Event("submit"));
        if (!formPromise) {
            return Promise.reject(t`Form didn't return a promise for submitting`);
        }
        return formPromise
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });
    };
}
