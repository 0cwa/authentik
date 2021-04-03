import { t } from "@lingui/macro";
import { customElement, html, property, TemplateResult } from "lit-element";
import { Event, EventsApi } from "authentik-api";
import { AKResponse } from "../../api/Client";
import { DEFAULT_CONFIG } from "../../api/Config";
import { EventWithContext } from "../../api/Events";
import { PAGE_SIZE } from "../../constants";
import { TableColumn } from "../../elements/table/Table";
import { TablePage } from "../../elements/table/TablePage";
import "./EventInfo";

@customElement("ak-event-list")
export class EventListPage extends TablePage<Event> {
    expandable = true;

    pageTitle(): string {
        return "Event Log";
    }
    pageDescription(): string | undefined {
        return;
    }
    pageIcon(): string {
        return "pf-icon pf-icon-catalog";
    }
    searchEnabled(): boolean {
        return true;
    }

    @property()
    order = "-created";

    apiEndpoint(page: number): Promise<AKResponse<Event>> {
        return new EventsApi(DEFAULT_CONFIG).eventsEventsList({
            ordering: this.order,
            page: page,
            pageSize: PAGE_SIZE,
            search: this.search || "",
        });
    }

    columns(): TableColumn[] {
        return [
            new TableColumn(t`Action`, t`action`),
            new TableColumn(t`User`, t`user`),
            new TableColumn(t`Creation Date`, t`created`),
            new TableColumn(t`Client IP`, t`client_ip`),
        ];
    }
    row(item: EventWithContext): TemplateResult[] {
        return [
            html`<div>${item.action}</div>
            <small>${item.app}</small>`,
            html`<div>${item.user?.username}</div>
            ${item.user.on_behalf_of ? html`<small>
                ${t`On behalf of ${item.user.on_behalf_of.username}`}
            </small>` : html``}`,
            html`<span>${item.created?.toLocaleString()}</span>`,
            html`<span>${item.clientIp}</span>`,
        ];
    }

    renderExpanded(item: Event): TemplateResult {
        return html`
        <td role="cell" colspan="1">
            <div class="pf-c-table__expandable-row-content">
                <ak-event-info .event=${item as EventWithContext}></ak-event-info>
            </div>
        </td>
        <td></td>
        <td></td>
        <td></td>`;
    }

}
