import { t } from "@lingui/macro";
import { CSSResult, customElement, html, LitElement, property, TemplateResult } from "lit-element";

import PFPage from "@patternfly/patternfly/components/Page/page.css";
import PFContent from "@patternfly/patternfly/components/Content/content.css";
import PFGallery from "@patternfly/patternfly/layouts/Gallery/gallery.css";
import PFCard from "@patternfly/patternfly/components/Card/card.css";
import PFDescriptionList from "@patternfly/patternfly/components/DescriptionList/description-list.css";
import PFSizing from "@patternfly/patternfly/utilities/Sizing/sizing.css";
import PFFlex from "@patternfly/patternfly/utilities/Flex/flex.css";
import PFDisplay from "@patternfly/patternfly/utilities/Display/display.css";
import AKGlobal from "../../../authentik.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";
import PFButton from "@patternfly/patternfly/components/Button/button.css";
import PFList from "@patternfly/patternfly/components/List/list.css";

import "../../../elements/buttons/SpinnerButton";
import "../../../elements/buttons/ActionButton";
import "../../../elements/CodeMirror";
import "../../../elements/Tabs";
import "../../../elements/events/ObjectChangelog";
import "../../../elements/forms/ModalForm";
import "./LDAPSourceForm";
import { until } from "lit-html/directives/until";
import { LDAPSource, SourcesApi, StatusEnum } from "@goauthentik/api";
import { DEFAULT_CONFIG } from "../../../api/Config";
import { EVENT_REFRESH } from "../../../constants";

@customElement("ak-source-ldap-view")
export class LDAPSourceViewPage extends LitElement {
    @property({ type: String })
    set sourceSlug(slug: string) {
        new SourcesApi(DEFAULT_CONFIG)
            .sourcesLdapRetrieve({
                slug: slug,
            })
            .then((source) => {
                this.source = source;
            });
    }

    @property({ attribute: false })
    source!: LDAPSource;

    static get styles(): CSSResult[] {
        return [
            PFBase,
            PFPage,
            PFButton,
            PFFlex,
            PFDisplay,
            PFGallery,
            PFContent,
            PFCard,
            PFDescriptionList,
            PFSizing,
            PFList,
            AKGlobal,
        ];
    }

    constructor() {
        super();
        this.addEventListener(EVENT_REFRESH, () => {
            if (!this.source?.slug) return;
            this.sourceSlug = this.source?.slug;
        });
    }

    render(): TemplateResult {
        if (!this.source) {
            return html``;
        }
        return html`<ak-tabs>
            <section
                slot="page-overview"
                data-tab-title="${t`Overview`}"
                class="pf-c-page__main-section pf-m-no-padding-mobile"
            >
                <div class="pf-u-display-flex pf-u-justify-content-center">
                    <div class="pf-u-w-75">
                        <div class="pf-c-card">
                            <div class="pf-c-card__body">
                                <dl class="pf-c-description-list pf-m-2-col-on-lg">
                                    <div class="pf-c-description-list__group">
                                        <dt class="pf-c-description-list__term">
                                            <span class="pf-c-description-list__text"
                                                >${t`Name`}</span
                                            >
                                        </dt>
                                        <dd class="pf-c-description-list__description">
                                            <div class="pf-c-description-list__text">
                                                ${this.source.name}
                                            </div>
                                        </dd>
                                    </div>
                                    <div class="pf-c-description-list__group">
                                        <dt class="pf-c-description-list__term">
                                            <span class="pf-c-description-list__text"
                                                >${t`Server URI`}</span
                                            >
                                        </dt>
                                        <dd class="pf-c-description-list__description">
                                            <div class="pf-c-description-list__text">
                                                ${this.source.serverUri}
                                            </div>
                                        </dd>
                                    </div>
                                    <div class="pf-c-description-list__group">
                                        <dt class="pf-c-description-list__term">
                                            <span class="pf-c-description-list__text"
                                                >${t`Base DN`}</span
                                            >
                                        </dt>
                                        <dd class="pf-c-description-list__description">
                                            <div class="pf-c-description-list__text">
                                                <ul>
                                                    <li>${this.source.baseDn}</li>
                                                </ul>
                                            </div>
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <div class="pf-c-card__footer">
                                <ak-forms-modal>
                                    <span slot="submit"> ${t`Update`} </span>
                                    <span slot="header"> ${t`Update LDAP Source`} </span>
                                    <ak-source-ldap-form
                                        slot="form"
                                        .instancePk=${this.source.slug}
                                    >
                                    </ak-source-ldap-form>
                                    <button slot="trigger" class="pf-c-button pf-m-primary">
                                        ${t`Edit`}
                                    </button>
                                </ak-forms-modal>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section
                slot="page-changelog"
                data-tab-title="${t`Changelog`}"
                class="pf-c-page__main-section pf-m-no-padding-mobile"
            >
                <div class="pf-c-card">
                    <div class="pf-c-card__body">
                        <ak-object-changelog
                            targetModelPk=${this.source.pk || ""}
                            targetModelApp="authentik_sources_ldap"
                            targetModelName="ldapsource"
                        >
                        </ak-object-changelog>
                    </div>
                </div>
            </section>
            <section
                slot="page-sync"
                data-tab-title="${t`Sync`}"
                class="pf-c-page__main-section pf-m-no-padding-mobile"
            >
                <div class="pf-u-display-flex pf-u-justify-content-center">
                    <div class="pf-u-w-75">
                        <div class="pf-c-card">
                            <div class="pf-c-card__title">
                                <p>${t`Sync status`}</p>
                            </div>
                            <div class="pf-c-card__body">
                                ${until(
                                    new SourcesApi(DEFAULT_CONFIG)
                                        .sourcesLdapSyncStatusList({
                                            slug: this.source.slug,
                                        })
                                        .then((tasks) => {
                                            if (tasks.length < 1) {
                                                return html`<p>${t`Not synced yet.`}</p>`;
                                            }
                                            return html`<ul class="pf-c-list">
                                                ${tasks.map((task) => {
                                                    let header = "";
                                                    if (task.status === StatusEnum.Warning) {
                                                        header = t`Task finished with warnings`;
                                                    } else if (task.status === StatusEnum.Error) {
                                                        header = t`Task finished with errors`;
                                                    } else {
                                                        header = t`Last sync: ${task.taskFinishTimestamp.toLocaleString()}`;
                                                    }
                                                    return html`<li>
                                                        <p>${task.taskName}</p>
                                                        <ul class="pf-c-list">
                                                            <li>${header}</li>
                                                            ${task.messages.map((m) => {
                                                                return html`<li>${m}</li>`;
                                                            })}
                                                        </ul>
                                                    </li> `;
                                                })}
                                            </ul>`;
                                        }),
                                    "loading",
                                )}
                            </div>
                            <div class="pf-c-card__footer">
                                <ak-action-button
                                    .apiRequest=${() => {
                                        return new SourcesApi(DEFAULT_CONFIG)
                                            .sourcesLdapPartialUpdate({
                                                slug: this.source?.slug || "",
                                                patchedLDAPSourceRequest: this.source,
                                            })
                                            .then(() => {
                                                this.dispatchEvent(
                                                    new CustomEvent(EVENT_REFRESH, {
                                                        bubbles: true,
                                                        composed: true,
                                                    }),
                                                );
                                            });
                                    }}
                                >
                                    ${t`Run sync again`}
                                </ak-action-button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </ak-tabs>`;
    }
}
