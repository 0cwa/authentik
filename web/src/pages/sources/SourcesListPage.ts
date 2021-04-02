import { gettext } from "django";
import { customElement, html, property, TemplateResult } from "lit-element";
import { AKResponse } from "../../api/Client";
import { TableColumn } from "../../elements/table/Table";
import { TablePage } from "../../elements/table/TablePage";

import "../../elements/buttons/SpinnerButton";
import "../../elements/buttons/Dropdown";
import "../../elements/forms/DeleteForm";
import "../../elements/forms/ModalForm";
import "../../elements/forms/ProxyForm";
import { until } from "lit-html/directives/until";
import { PAGE_SIZE } from "../../constants";
import { Source, SourcesApi } from "authentik-api";
import { DEFAULT_CONFIG } from "../../api/Config";
import { ifDefined } from "lit-html/directives/if-defined";
import "./ldap/LDAPSourceForm";
import "./saml/SAMLSourceForm";
import "./oauth/OAuthSourceForm";

@customElement("ak-source-list")
export class SourceListPage extends TablePage<Source> {
    pageTitle(): string {
        return "Sources";
    }
    pageDescription(): string | undefined {
        return "External Sources which can be used to get Identities into authentik, for example Social Providers like Twiter and GitHub or Enterprise Providers like ADFS and LDAP.";
    }
    pageIcon(): string {
        return "pf-icon pf-icon-middleware";
    }
    searchEnabled(): boolean {
        return true;
    }

    @property()
    order = "name";

    apiEndpoint(page: number): Promise<AKResponse<Source>> {
        return new SourcesApi(DEFAULT_CONFIG).sourcesAllList({
            ordering: this.order,
            page: page,
            pageSize: PAGE_SIZE,
            search: this.search || "",
        });
    }

    columns(): TableColumn[] {
        return [
            new TableColumn("Name", "name"),
            new TableColumn("Type", "verboseName"),
            new TableColumn(""),
        ];
    }

    row(item: Source): TemplateResult[] {
        return [
            html`<a href="#/core/sources/${item.slug}">
                <div>${item.name}</div>
                ${item.enabled ? html`` : html`<small>${gettext("Disabled")}</small>`}
            </a>`,
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
                        "sourceSlug": item.slug
                    }}
                    type=${ifDefined(item.objectType)}
                    .typeMap=${{
                        "ldap": "ak-source-ldap-form",
                        "saml": "ak-source-saml-form",
                        "oauth": "ak-source-oauth-form",
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
                    return new SourcesApi(DEFAULT_CONFIG).sourcesAllDelete({
                        slug: item.slug || ""
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
                ${until(new SourcesApi(DEFAULT_CONFIG).sourcesAllTypes().then((types) => {
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
