import { t } from "@lingui/macro";
import { CSSResult } from "lit-element";
import { html, TemplateResult } from "lit-html";
import { ifDefined } from "lit-html/directives/if-defined";
import { Table } from "./Table";
import "./TableSearch";
import PFPage from "@patternfly/patternfly/components/Page/page.css";
import PFContent from "@patternfly/patternfly/components/Content/content.css";

export abstract class TablePage<T> extends Table<T> {
    abstract pageTitle(): string;
    abstract pageDescription(): string | undefined;
    abstract pageIcon(): string;
    abstract searchEnabled(): boolean;

    static get styles(): CSSResult[] {
        return super.styles.concat(PFPage, PFContent);
    }

    renderSearch(): TemplateResult {
        if (!this.searchEnabled()) {
            return super.renderSearch();
        }
        return html`<ak-table-search value=${ifDefined(this.search)} .onSearch=${(value: string) => {
            this.search = value;
            this.fetch();
        }}>
        </ak-table-search>&nbsp;`;
    }

    render(): TemplateResult {
        const description = this.pageDescription();
        return html`<section class="pf-c-page__main-section pf-m-light">
                <div class="pf-c-content">
                    <h1>
                        <i class="${this.pageIcon()}"></i>
                        ${t`${this.pageTitle()}`}
                    </h1>
                    ${description ? html`<p>${t`${description}`}</p>` : html``}
                </div>
            </section>
            <section class="pf-c-page__main-section pf-m-no-padding-mobile">
                <div class="pf-c-card">${this.renderTable()}</div>
            </section>`;
    }
}
