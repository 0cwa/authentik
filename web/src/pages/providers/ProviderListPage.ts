import { gettext } from "django";
import { customElement, html, property, TemplateResult } from "lit-element";
import { AKResponse } from "../../api/Client";
import { TablePage } from "../../elements/table/TablePage";

import "../../elements/buttons/SpinnerButton";
import "../../elements/buttons/Dropdown";
import "../../elements/forms/DeleteForm";
import "../../elements/forms/ModalForm";
import "../../elements/forms/ProxyForm";
import "./oauth2/OAuth2ProviderForm";
import "./proxy/ProxyProviderForm";
import "./saml/SAMLProviderForm";
import "./saml/SAMLProviderImportForm";
import { TableColumn } from "../../elements/table/Table";
import { until } from "lit-html/directives/until";
import { PAGE_SIZE } from "../../constants";
import { Provider, ProvidersApi } from "authentik-api";
import { DEFAULT_CONFIG } from "../../api/Config";
import { ifDefined } from "lit-html/directives/if-defined";

@customElement("ak-provider-list")
export class ProviderListPage extends TablePage<Provider> {
    searchEnabled(): boolean {
        return true;
    }
    pageTitle(): string {
        return gettext("Provider");
    }
    pageDescription(): string {
        return gettext("Provide support for protocols like SAML and OAuth to assigned applications.");
    }
    pageIcon(): string {
        return "pf-icon pf-icon-integration";
    }

    @property()
    order = "name";

    apiEndpoint(page: number): Promise<AKResponse<Provider>> {
        return new ProvidersApi(DEFAULT_CONFIG).providersAllList({
            ordering: this.order,
            page: page,
            pageSize: PAGE_SIZE,
            search: this.search || "",
        });
    }

    columns(): TableColumn[] {
        return [
            new TableColumn("Name", "name"),
            new TableColumn("Application"),
            new TableColumn("Type", "type"),
            new TableColumn(""),
        ];
    }

    row(item: Provider): TemplateResult[] {
        return [
            html`<a href="#/core/providers/${item.pk}">
                ${item.name}
            </a>`,
            item.assignedApplicationName ?
                html`<i class="pf-icon pf-icon-ok"></i>
                    ${gettext("Assigned to application ")}
                    <a href="#/core/applications/${item.assignedApplicationSlug}">${item.assignedApplicationName}</a>` :
                html`<i class="pf-icon pf-icon-warning-triangle"></i>
                ${gettext("Warning: Provider not assigned to any application.")}`,
            html`${item.verboseName}`,
            html`
            <ak-forms-modal>
                <span slot="submit">
                    ${gettext("Update")}
                </span>
                <span slot="header">
                    ${gettext(`Update ${item.verboseName}`)}
                </span>
                <ak-proxy-form
                    slot="form"
                    .args=${{
                        "providerUUID": item.pk
                    }}
                    type=${ifDefined(item.objectType)}
                    .typeMap=${{
                        "oauth2": "ak-provider-oauth2-form",
                        "saml": "ak-provider-saml-form",
                        "proxy": "ak-provider-proxy-form",
                    }}>
                </ak-proxy-form>
                <button slot="trigger" class="pf-c-button pf-m-secondary">
                    ${gettext("Edit")}
                </button>
            </ak-forms-modal>
            <ak-forms-delete
                .obj=${item}
                objectLabel=${gettext("Source")}
                .delete=${() => {
                    return new ProvidersApi(DEFAULT_CONFIG).providersAllDelete({
                        id: item.pk || 0
                    });
                }}>
                <button slot="trigger" class="pf-c-button pf-m-danger">
                    ${gettext("Delete")}
                </button>
            </ak-forms-delete>`,
        ];
    }

    renderToolbar(): TemplateResult {
        return html`
        <ak-dropdown class="pf-c-dropdown">
            <button class="pf-m-primary pf-c-dropdown__toggle" type="button">
                <span class="pf-c-dropdown__toggle-text">${gettext("Create")}</span>
                <i class="fas fa-caret-down pf-c-dropdown__toggle-icon" aria-hidden="true"></i>
            </button>
            <ul class="pf-c-dropdown__menu" hidden>
                ${until(new ProvidersApi(DEFAULT_CONFIG).providersAllTypes().then((types) => {
                    return types.map((type) => {
                        return html`<li>
                            <ak-forms-modal>
                                <span slot="submit">
                                    ${gettext("Create")}
                                </span>
                                <span slot="header">
                                    ${gettext(`Create ${type.name}`)}
                                </span>
                                <ak-proxy-form
                                    slot="form"
                                    type=${type.component}>
                                </ak-proxy-form>
                                <button slot="trigger" class="pf-c-dropdown__menu-item">
                                    ${type.name}<br>
                                    <small>${type.description}</small>
                                </button>
                            </ak-forms-modal>
                        </li>`;
                    });
                }), html`<ak-spinner></ak-spinner>`)}
            </ul>
        </ak-dropdown>
        ${super.renderToolbar()}`;
    }

}
