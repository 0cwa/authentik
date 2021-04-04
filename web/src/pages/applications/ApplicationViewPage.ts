import { t } from "@lingui/macro";
import { css, CSSResult, customElement, html, LitElement, property, TemplateResult } from "lit-element";

import "../../elements/Tabs";
import "../../elements/charts/ApplicationAuthorizeChart";
import "../../elements/buttons/SpinnerButton";
import "../../elements/EmptyState";
import "../../elements/events/ObjectChangelog";
import "../policies/BoundPoliciesList";
import "./ApplicationForm";
import { Application, CoreApi } from "authentik-api";
import { DEFAULT_CONFIG } from "../../api/Config";
import PFPage from "@patternfly/patternfly/components/Page/page.css";
import PFContent from "@patternfly/patternfly/components/Content/content.css";
import PFGallery from "@patternfly/patternfly/layouts/Gallery/gallery.css";
import PFCard from "@patternfly/patternfly/components/Card/card.css";
import AKGlobal from "../../authentik.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";
import PFButton from "@patternfly/patternfly/components/Button/button.css";

@customElement("ak-application-view")
export class ApplicationViewPage extends LitElement {

    @property()
    set applicationSlug(value: string) {
        new CoreApi(DEFAULT_CONFIG).coreApplicationsRead({
            slug: value
        }).then((app) => {
            this.application = app;
        });
    }

    @property({attribute: false})
    application!: Application;

    static get styles(): CSSResult[] {
        return [PFBase, PFPage, PFContent, PFButton, PFGallery, PFCard, AKGlobal].concat(
            css`
                img.pf-icon {
                    max-height: 24px;
                }
                ak-tabs {
                    height: 100%;
                }
            `
        );
    }

    render(): TemplateResult {
        if (!this.application) {
            return html`<section class="pf-c-page__main-section pf-m-light">
                <div class="pf-c-content">
                    <h1>
                        ${t`Loading...`}
                    </h1>
                </div>
            </section>
            <ak-empty-state
                ?loading="${true}"
                header=${t`Loading`}>
            </ak-empty-state>`;
        }
        return html`<section class="pf-c-page__main-section pf-m-light">
                <div class="pf-c-content">
                    <h1>
                        <img class="pf-icon" src="${this.application?.metaIcon || ""}" />
                        ${this.application?.name}
                    </h1>
                    <p>${this.application?.metaPublisher}</p>
                </div>
            </section>
            <ak-tabs>
                <section slot="page-1" data-tab-title="${t`Overview`}" class="pf-c-page__main-section pf-m-no-padding-mobile">
                    <div class="pf-l-gallery pf-m-gutter">
                        <div class="pf-c-card pf-l-gallery__item" style="grid-column-end: span 3;grid-row-end: span 2;">
                            <div class="pf-c-card__title">${t`Logins over the last 24 hours`}</div>
                            <div class="pf-c-card__body">
                                ${this.application && html`
                                    <ak-charts-application-authorize applicationSlug=${this.application.slug}>
                                    </ak-charts-application-authorize>`}
                            </div>
                        </div>
                        <div class="pf-c-card pf-l-gallery__item">
                            <div class="pf-c-card__title">${t`Related`}</div>
                            <div class="pf-c-card__body">
                                <dl class="pf-c-description-list">
                                    ${this.application.provider ?
                                    html`<div class="pf-c-description-list__group">
                                            <dt class="pf-c-description-list__term">
                                                <span class="pf-c-description-list__text">${t`Provider`}</span>
                                            </dt>
                                            <dd class="pf-c-description-list__description">
                                                <div class="pf-c-description-list__text">
                                                    <a href="#/core/providers/${this.application.provider.pk}">
                                                        ${this.application.provider.name}
                                                    </a>
                                                </div>
                                            </dd>
                                        </div>`:
                                    html``}
                                    <div class="pf-c-description-list__group">
                                        <dt class="pf-c-description-list__term">
                                            <span class="pf-c-description-list__text">${t`Edit`}</span>
                                        </dt>
                                        <dd class="pf-c-description-list__description">
                                            <div class="pf-c-description-list__text">
                                                <ak-forms-modal>
                                                    <span slot="submit">
                                                        ${t`Update`}
                                                    </span>
                                                    <span slot="header">
                                                        ${t`Update Application`}
                                                    </span>
                                                    <ak-application-form slot="form" .application=${this.application}>
                                                    </ak-application-form>
                                                    <button slot="trigger" class="pf-c-button pf-m-secondary">
                                                        ${t`Edit`}
                                                    </button>
                                                </ak-forms-modal>
                                            </div>
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                        <div class="pf-c-card pf-l-gallery__item" style="grid-column-end: span 3;grid-row-end: span 2;">
                            <div class="pf-c-card__title">${t`Changelog`}</div>
                            <div class="pf-c-card__body">
                                <ak-object-changelog
                                    targetModelPk=${this.application.pk || ""}
                                    targetModelApp="authentik_core"
                                    targetModelName="application">
                                </ak-object-changelog>
                            </div>
                        </div>
                    </div>
                </section>
                <div slot="page-2" data-tab-title="${t`Policy Bindings`}" class="pf-c-page__main-section pf-m-no-padding-mobile">
                    <div class="pf-c-card">
                        <div class="pf-c-card__title">${t`These policies control which users can access this application.`}</div>
                        <ak-bound-policies-list .target=${this.application.pk}>
                        </ak-bound-policies-list>
                    </div>
                </div>
            </ak-tabs>`;
    }
}
