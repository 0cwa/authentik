import { gettext } from "django";
import { customElement, html, property, TemplateResult } from "lit-element";
import { AKResponse } from "../../../api/Client";
import { TablePage } from "../../../elements/table/TablePage";

import "../../../elements/buttons/ModalButton";
import "../../../elements/buttons/SpinnerButton";
import "../../../elements/forms/DeleteForm";
import "../../../elements/forms/ModalForm";
import "./InvitationForm";
import { TableColumn } from "../../../elements/table/Table";
import { PAGE_SIZE } from "../../../constants";
import { Invitation, StagesApi } from "authentik-api";
import { DEFAULT_CONFIG } from "../../../api/Config";

@customElement("ak-stage-invitation-list")
export class InvitationListPage extends TablePage<Invitation> {
    searchEnabled(): boolean {
        return true;
    }
    pageTitle(): string {
        return gettext("Invitations");
    }
    pageDescription(): string {
        return gettext("Create Invitation Links to enroll Users, and optionally force specific attributes of their account.");
    }
    pageIcon(): string {
        return "pf-icon pf-icon-migration";
    }

    @property()
    order = "expires";

    apiEndpoint(page: number): Promise<AKResponse<Invitation>> {
        return new StagesApi(DEFAULT_CONFIG).stagesInvitationInvitationsList({
            ordering: this.order,
            page: page,
            pageSize: PAGE_SIZE,
            search: this.search || "",
        });
    }

    columns(): TableColumn[] {
        return [
            new TableColumn("ID", "pk"),
            new TableColumn("Created by", "created_by"),
            new TableColumn("Expiry"),
            new TableColumn(""),
        ];
    }

    row(item: Invitation): TemplateResult[] {
        return [
            html`${item.pk}`,
            html`${item.createdBy?.username}`,
            html`${item.expires?.toLocaleString()}`,
            html`
            <ak-forms-delete
                .obj=${item}
                objectLabel=${gettext("Prompt")}
                .delete=${() => {
                    return new StagesApi(DEFAULT_CONFIG).stagesInvitationInvitationsDelete({
                        inviteUuid: item.pk || ""
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
        <ak-forms-modal>
            <span slot="submit">
                ${gettext("Create")}
            </span>
            <span slot="header">
                ${gettext("Create Invitation")}
            </span>
            <ak-invitation-form slot="form">
            </ak-invitation-form>
            <button slot="trigger" class="pf-c-button pf-m-primary">
                ${gettext("Create")}
            </button>
        </ak-forms-modal>
        ${super.renderToolbar()}
        `;
    }
}
