import { css, CSSResult, customElement, html, LitElement, property, TemplateResult } from "lit-element";
import PFPage from "@patternfly/patternfly/components/Page/page.css";
import PFGlobal from "@patternfly/patternfly/patternfly-base.css";
import { configureSentry } from "../../api/Sentry";
import { Config } from "authentik-api";
import { ifDefined } from "lit-html/directives/if-defined";

export const DefaultConfig: Config = {
    brandingLogo: " /static/dist/assets/icons/icon_left_brand.svg",
    brandingTitle: "authentik",

    errorReportingEnabled: false,
    errorReportingEnvironment: "",
    errorReportingSendPii: false,
};

@customElement("ak-sidebar-brand")
export class SidebarBrand extends LitElement {
    @property({attribute: false})
    config: Config = DefaultConfig;

    static get styles(): CSSResult[] {
        return [
            PFGlobal,
            PFPage,
            css`
                :host {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 114px;
                    min-height: 114px;
                }
                .pf-c-brand img {
                    width: 100%;
                    padding: 0 .5rem;
                    height: 42px;
                }
            `,
        ];
    }

    firstUpdated(): void {
        configureSentry().then((c) => {this.config = c;});
    }

    render(): TemplateResult {
        return html` <a href="#/" class="pf-c-page__header-brand-link">
            <div class="pf-c-brand ak-brand">
                <img src="${ifDefined(this.config.brandingLogo)}" alt="authentik icon" loading="lazy" />
            </div>
        </a>`;
    }
}
