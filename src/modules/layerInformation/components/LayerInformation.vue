<script>
import getters from "../store/gettersLayerInformation";
import mutations from "../store/mutationsLayerInformation";
import ToolWindow from "../../../share-components/ToolWindow.vue";
import { isWebLink } from "../../../utils/urlHelper";
import { mapActions, mapGetters, mapMutations } from "vuex";

/**
 * The Layer Information that gives the user information, links and the legend for a layer
 */
export default {
    name: "LayerInformation",
    components: {
        ToolWindow,
    },
    data() {
        return {
            activeTab: "layerinfo-text",
            openDropdown: false,
            logo: "./resources/img/logo-umweltatlas.svg",
            contactPerson: "./resources/img/contact_placeholder.svg",
        };
    },
    computed: {
        ...mapGetters("LayerInformation", Object.keys(getters)),
        ...mapGetters(["metaDataCatalogueId"]),
        showAdditionalMetaData() {
            return (
                this.layerInfo.metaURL !== null &&
                typeof this.abstractText !== "undefined" &&
                this.abstractText !== this.noMetaDataMessage &&
                this.abstractText !== this.noMetadataLoaded
            );
        },
        showCustomMetaData() {
            return this.customText;
        },
        // showInfoURL() {
        //     return this.infoURL;
        // },
        showPublication() {
            return (
                typeof this.datePublication !== "undefined" &&
                this.datePublication !== null &&
                this.datePublication !== ""
            );
        },
        showRevision() {
            return (
                typeof this.dateRevision !== "undefined" &&
                this.dateRevision !== null &&
                this.dateRevision !== ""
            );
        },
        showPeriodicity() {
            return (
                this.periodicityKey !== "" &&
                this.periodicityKey !== null &&
                this.periodicityKey !== undefined
            );
        },
        showDownloadLinks() {
            return this.downloadLinks !== null;
        },
        showUrl() {
            return (
                (this.layerInfo.url !== null &&
                    this.layerInfo.typ !== "SensorThings" &&
                    this.showUrlGlobal === true) ||
                (this.layerInfo.url !== null &&
                    this.layerInfo.typ !== "SensorThings" &&
                    this.showUrlGlobal === undefined &&
                    this.layerInfo.urlIsVisible !== false)
            );
        },
        showAttachFile() {
            return this.downloadLinks && this.downloadLinks.length > 1;
        },
        layerUrl() {
            return Array.isArray(this.layerInfo.url)
                ? this.layerInfo.url
                      .map((url, i) => ({ url, typ: this.layerInfo.typ?.[i] }))
                      .map(this.getGetCapabilitiesUrl)
                : this.getGetCapabilitiesUrl({
                      url: this.layerInfo.url,
                      typ: this.layerInfo.typ,
                  });
        },
        showMoreLayers() {
            if (this.layerInfo.metaIdArray) {
                return (
                    this.layerInfo.metaIdArray.length > 1 &&
                    !this.layerInfo.metaIdArray.every((item) => item === null)
                );
            }
            return false;
        },
        showInformation() {
            return this.active;
        },
        legendURL() {
            return this.layerInfo.legendURL;
        },
    },

    created() {
        this.setConfigs();
    },

    mounted() {
        if (this.metaDataCatalogueId) {
            this.setMetaDataCatalogueId(this.metaDataCatalogueId);
        }
        // might be caught from self when triggerClose() is called
        Backbone.Events.listenTo(Radio.channel("Layer"), {
            setLayerInfoChecked: (value) => {
                if (!value) {
                    this.close();
                }
            },
        });
    },

    methods: {
        ...mapActions("LayerInformation", [
            "changeLayerInfo",
            "activate",
            "setConfigParams",
        ]),
        ...mapMutations("LayerInformation", Object.keys(mutations)),
        isWebLink,
        /**
         * Closes the LayerInformation
         * @returns {void}
         */
        close() {
            this.setActive(false);
            this.$emit("close");
        },
        /**
         * Trigger (Radio) close related events
         * @returns {void}
         */
        triggerClose() {
            Radio.trigger("Layer", "setLayerInfoChecked", false);
            Radio.trigger(
                "LayerInformation",
                "unhighlightLayerInformationIcon"
            );
        },
        /**
         * Changes the abstract Text in case of group layer, closes the dropdown manually
         * @param {Event} ev click event of dropdown
         * @returns {void}
         */
        changeLayerAbstract(ev) {
            ev.stopPropagation();
            this.changeLayerInfo(ev.target.text);
            this.setCurrentLayerName(ev.target.text);
            this.openDropdown = false;
        },
        /**
         * checks if the given tab name is currently active
         * @param {String} tab the tab name
         * @returns {Boolean}  true if the given tab name is active
         */
        isActiveTab(tab) {
            return this.activeTab === tab;
        },
        /**
         * set the current tab id after clicking.
         * @param {Object[]} evt the target of current click event
         * @returns {void}
         */
        setActiveTab(evt) {
            if (evt && evt.target && evt.target.hash) {
                this.activeTab = evt.target.hash.substring(1);
            }
        },
        /**
         * returns the classnames for the tab
         * @param {String} tab name of the tab depending on property activeTab
         * @returns {String} classNames of the tab
         */
        getTabPaneClasses(tab) {
            return {
                active: this.isActiveTab(tab),
                show: this.isActiveTab(tab),
                "tab-pane": true,
                fade: true,
            };
        },
        /**
         * stops the click event from closing the menu tree
         * @param {String} evt click event
         * @returns {void}
         */
        onClick(evt) {
            evt.stopPropagation();
        },
        /**
         * stops the click event from closing the menu tree but also opens the dropdown Menu
         * @param {String} evt click event
         * @returns {void}
         */
        onClickDropdown(evt) {
            evt.stopPropagation();
            this.openDropdown = true;
        },
        setConfigs() {
            this.setConfigParams(Config);
        },
        /**
         * generates a GetCapabilities URL from a given service base address and type
         * @param {String} url service base URL
         * @param {String} typ service type (e.g., WMS)
         * @returns {String} GetCapabilities URL
         */
        getGetCapabilitiesUrl({ url, typ }) {
            const urlObject = new URL(url, location.href);

            if (typ !== "OAF") {
                urlObject.searchParams.set("SERVICE", typ);
                urlObject.searchParams.set("REQUEST", "GetCapabilities");
            }
            return urlObject.href;
        },
        copyToClipboard() {
            const copyText = document.getElementById("wmswmf-input");
            copyText.select();
            copyText.setSelectionRange(0, 99999); /* For mobile devices */
            navigator.clipboard.writeText(copyText.value);
        },
    },
};
</script>

<template lang="html">
    <ToolWindow
        v-if="showInformation"
        id="layerInformation"
        class="layerInformation"
        @close="triggerClose"
    >
        <template #title>
            <span>{{
                $t("common:modules.layerInformation.informationAndLegend")
            }}</span>
        </template>
        <template #body>
            <div class="body">
                <ul class="nav nav-tabs">
                    <li
                        v-if="legendURL !== 'ignore'"
                        value="layerinfo-text"
                        class="nav-item"
                        role="button"
                        tabindex="0"
                        @click="onClick"
                        @keydown.enter="onClick"
                    >
                        <a
                            href="#layerinfo-text"
                            class="nav-link"
                            :class="{ active: isActiveTab('layerinfo-text') }"
                            @click="setActiveTab"
                            >Metadaten
                        </a>
                    </li>
                    <li
                        v-if="legendURL !== 'ignore'"
                        value="layerinfo-legend"
                        class="nav-item"
                        role="button"
                        tabindex="0"
                        @click="onClick"
                        @keydown.enter="onClick"
                    >
                        <a
                            href="#layerinfo-legend"
                            class="nav-link"
                            :class="{ active: isActiveTab('layerinfo-legend') }"
                            @click="setActiveTab"
                            >{{ $t("common:modules.layerInformation.legend") }}
                        </a>
                    </li>
                    <!-- <li
                        v-if="showDownloadLinks"
                        value="LayerInfoDataDownload"
                        class="nav-item"
                        role="button"
                        tabindex="0"
                        @click="onClick"
                        @keydown.enter="onClick"
                    >
                        <a
                            href="#LayerInfoDataDownload"
                            class="nav-link"
                            :class="{
                                active: isActiveTab('LayerInfoDataDownload'),
                            }"
                            @click="setActiveTab"
                            >{{
                                $t(
                                    "common:modules.layerInformation.downloadDataset"
                                )
                            }}
                        </a>
                    </li> -->
                    <li
                        v-if="showUrl"
                        value="url"
                        class="nav-item"
                        role="button"
                        tabindex="0"
                        @click="onClick"
                        @keydown.enter="onClick"
                    >
                        <a
                            href="#url"
                            class="nav-link"
                            :class="{ active: isActiveTab('url') }"
                            @click="setActiveTab"
                            >{{
                                Array.isArray(layerInfo.url)
                                    ? $t(
                                          "common:modules.layerInformation.multiAddress"
                                      )
                                    : $t(layerInfo.typ) +
                                      " - " +
                                      $t(
                                          "common:modules.layerInformation.addressSuffix"
                                      )
                            }}
                        </a>
                    </li>

                    <li
                        v-if="layerInfo?.download"
                        value="download-map"
                        class="nav-item"
                        role="button"
                        tabindex="0"
                        @click="onClick"
                        @keydown.enter="onClick"
                    >
                        <a
                            href="#download-map"
                            class="nav-link"
                            :class="{ active: isActiveTab('download-map') }"
                            @click="setActiveTab"
                            >Download
                        </a>
                    </li>
                </ul>
                <div class="tab-content">
                    <div id="layer-accordions" @click="onClick">
                        <div v-if="layerInfo?.infoURL">
                            <input
                                type="checkbox"
                                id="section1"
                                @click="onClick"
                            />
                            <label for="section1" class="accordion-header">
                                <span class="header-icon">▾</span>

                                <span class="header-title">Umweltatlas</span>
                            </label>
                            <div class="content">
                                <div style="display: flex">
                                    <img
                                        style="
                                            width: 100px;
                                            flex: inherit;
                                            margin-right: 20px;
                                        "
                                        alt="umweltatlas logo"
                                        :src="logo"
                                    />
                                    <p style="flex: 1">
                                        Ausführliche Informationen zum
                                        ausgewählten Datensatz, wie
                                        Informations- und Datengrundlagen,
                                        Methoden sowie relevante
                                        Begleitliteratur und einem
                                        Kartenimpressum finden Sie im

                                        <a
                                            :href="layerInfo.infoURL"
                                            target="_blank"
                                            @click="onClick"
                                        >
                                            Umweltatlas
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div v-if="layerInfo?.contact">
                            <input
                                type="checkbox"
                                id="section2"
                                @click="onClick"
                            />
                            <label for="section2" class="accordion-header">
                                <span class="header-icon">▾</span>
                                <span class="header-title">Kontakt</span>
                            </label>
                            <div class="content">
                                <div style="display: flex">
                                    <img
                                        style="
                                            width: 100px;
                                            flex: inherit;
                                            margin-right: 20px;
                                        "
                                        alt="Kontaktperson"
                                        :src="contactPerson"
                                    />
                                    <div style="flex: 1">
                                        <p class="bold">
                                            Ansprechperson zum ausgewählten
                                            Datensatz
                                        </p>
                                        <p class="bold">
                                            {{ layerInfo?.contact.name }}
                                        </p>
                                        <p>{{ layerInfo?.contact.tel }}</p>
                                        <p>{{ layerInfo?.contact.email }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Add more sections as needed -->
                    </div>
                    <div v-if="title" id="layer-info-title">
                        {{ title }}
                    </div>
                    <div
                        v-if="legendURL !== 'ignore'"
                        id="layerinfo-legend"
                        :class="getTabPaneClasses('layerinfo-legend')"
                        :show="isActiveTab('layerinfo-legend')"
                        :type="String('layerinfo-legend')"
                    />
                    <div
                        id="layerinfo-text"
                        class=""
                        :class="getTabPaneClasses('layerinfo-text')"
                        :show="isActiveTab('layerinfo-text')"
                        :type="String('layerinfo-text')"
                    >
                        <div v-if="showMoreLayers" class="dropdown mb-2">
                            <button
                                id="changeLayerInfo"
                                class="btn btn-outline-default dropdown-toggle"
                                :class="{ show: openDropdown }"
                                type="button"
                                @click="onClickDropdown"
                            >
                                {{
                                    $t(
                                        "common:modules.layerInformation.changeLayerInfo"
                                    )
                                }}
                                <span class="caret" />
                            </button>
                            <ul
                                class="dropdown-menu"
                                :class="{ show: openDropdown }"
                            >
                                <li
                                    v-for="name in layerInfo.layerNames"
                                    :key="name"
                                >
                                    <a
                                        href="#"
                                        class="dropdown-item abstractChange"
                                        :class="{
                                            active: name === currentLayerName,
                                        }"
                                        @click="changeLayerAbstract"
                                        >{{ $t(name) }}</a
                                    >
                                </li>
                            </ul>
                        </div>
                        <div
                            class="abstract bottom-line"
                            v-html="abstractText"
                        />
                        <p v-if="showPublication" class="bottom-line">
                            {{
                                $t(
                                    "common:modules.layerInformation.publicationCreation"
                                )
                            }}: {{ datePublication }}
                        </p>
                        <p v-if="showRevision" class="bottom-line">
                            {{
                                $t(
                                    "common:modules.layerInformation.lastModified"
                                )
                            }}:
                            {{ dateRevision }}
                        </p>
                        <p v-if="showPeriodicity" class="bottom-line">
                            {{
                                $t(
                                    "common:modules.layerInformation.periodicityTitle"
                                )
                            }}: {{ $t(periodicityKey) }}
                        </p>
                        <template v-if="showCustomMetaData" class="bottom-line">
                            <div v-for="(key, value) in customText" :key="key">
                                <p v-if="isWebLink(key)" class="mb-0">
                                    {{ value + ": " }}
                                    <a :href="value" target="_blank">{{
                                        key
                                    }}</a>
                                </p>
                                <p v-else class="mb-0">
                                    {{ value + ": " + key }}
                                </p>
                            </div>
                        </template>
                        <div v-if="showAdditionalMetaData">
                            <p v-for="url in metaURLs" :key="url">
                                <a :href="url" target="_blank" @click="onClick">
                                    {{
                                        $t(
                                            "common:modules.layerInformation.additionalMetadata"
                                        )
                                    }}
                                </a>
                            </p>
                        </div>
                    </div>

                    <div
                        v-if="showUrl"
                        id="url"
                        :show="isActiveTab('url')"
                        :class="getTabPaneClasses('url')"
                        :type="String('url')"
                    >
                        <div class="wmswmf-container">
                            <p>
                                <span>{{ $t(layerInfo.typ) }}</span
                                >-Adresse
                            </p>
                            <div class="wmswmf-input-wrapper">
                                <input
                                    type="text"
                                    id="wmswmf-input"
                                    :value="layerInfo.url"
                                    readonly
                                />

                                <div class="input-btns">
                                    <button
                                        class="btn copy-btn input-btn"
                                        @click="copyToClipboard()"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-copy"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                                            />
                                        </svg>
                                    </button>

                                    <a
                                        :href="layerInfo.url"
                                        target="_blank"
                                        @click="onClick"
                                        class="input-btn"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            class="bi bi-box-arrow-up-right"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"
                                            />
                                            <path
                                                fill-rule="evenodd"
                                                d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"
                                            />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            <p>
                                Hier finden Sie <a href="">Videoressourcen</a>,
                                die die Arbeit mit WMS- und WFS- Formate leicht
                                zugänglich vermitteln.
                            </p>

                            <div
                                style="
                                    width: 100%;
                                    height: 200px;
                                    background-color: #ededed;
                                    text-align: center;
                                    display: grid;
                                "
                            >
                                Hier gibt es bald ein
                                <br />
                                Erklärungsvideo
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="showUrl"
                        id="download-map"
                        :show="isActiveTab('download-map')"
                        :class="getTabPaneClasses('download-map')"
                        :type="String('download-map')"
                        style="display: flex; margin-top: 10px"
                    >
                        <button class="download-btn btn">
                            <a
                                :href="layerInfo.download"
                                target="_blank"
                                @click="onClick"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    class="bi bi-download"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"
                                    />
                                    <path
                                        d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"
                                    />
                                </svg>
                                PDF
                            </a>
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </ToolWindow>
</template>

<style lang="scss" scoped>
@import "~variables";

.subtitle {
    color: $light_red;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
    padding-top: 1px;
    margin-bottom: 9px;
}
hr {
    margin: 15px 0 10px 0;
}

.body {
    > ul {
        background-color: $white;
    }
    max-height: 66vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 5px 10px;
    font-size: $font-size-base;
}

.layerInformation {
    position: absolute;
    overflow: unset;
    top: 20px;
    right: 60px;
    max-width: 600px;
    width: 45vw;
    margin: 0 10px 30px 10px;
    z-index: 1010;
    background-color: $white;
    box-shadow: 8px 8px 12px rgba(0, 0, 0, 0.176);
    border: 1px solid $light_grey;

    @include media-breakpoint-down(sm) {
        inset: 12px auto auto 0;
        max-width: 750px;
        width: 95vw;
        max-height: 80vh;
    }
}

.header {
    padding: 10px 10px 5px 10px;
    border-bottom: 1px solid $light_grey;
    cursor: move;
}
.bi-x-lg {
    &:hover {
        opacity: 0.7;
        cursor: pointer;
    }
}

.nav-tabs {
    display: flex;
    > li {
        font-size: $font-size-base;
        > a {
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
}
.tab-content {
    .tab-pane {
        > ul {
            > li {
                > a {
                    font-size: $font-size-base;
                    text-overflow: ellipsis;
                    display: inline-block;
                    max-width: 95%;
                    overflow: hidden;
                }
            }
        }
    }
    #layerinfo-legend {
        max-width: 95%;
        overflow: auto;
    }
}

.mb-2 {
    margin-bottom: 2rem;
}

.dropdown-toggle {
    width: 100%;
}

.dropdown-menu {
    width: 100%;
    a.active {
        background-color: $accent_active;
        color: white;
    }
    a:hover {
        background-color: $accent_hover;
    }
}

.download-note {
    font-weight: bold;
}

.bold {
    font-weight: bold;
}

.pt-5 {
    padding-top: 5px;
}

.content p {
    margin: 0px;
}

.wmswmf-container {
    margin-top: 10px;

    p {
        margin-bottom: 5px;
    }

    input {
        padding: 5px;
        width: 100%;
        border: none;
        margin-bottom: 5px;
        border: 1px solid #cccccc;
    }

    .wmswmf-input-wrapper {
        position: relative;
        margin-bottom: 5px;

        input:active {
            border-color: $uatlas_orange_light; /* Orange border */
        }

        input:focus {
            outline: none; /* Removes the default focus outline */
            border-color: $uatlas_orange_light; /* Orange border */
        }

        .input-btns {
            border: none;
            position: absolute;
            right: 5px;
            top: 0px;
        }

        .input-btn {
            color: #cccccc;
            border: none;
            cursor: pointer;
            padding: 2px;
            box-shadow: none;
        }

        .input-btn:hover {
            color: $uatlas_orange_light;
        }
    }
}

// download btns
.download-btn {
    background-color: #e6e6e6; /* Orange background */
    flex: 1;
}

.download-btn a {
    width: 100%;
    display: inline-block;
    color: white;
}

.download-btn:hover {
    color: white;
    background-color: #ffa500;
}
.download-btn svg {
    margin-bottom: 5px;
}

/*  layer accordions */
#layer-accordions {
    width: 100%; /* Or max-width for a specific size */
}

#layer-accordions input {
    display: none;
}

#layer-accordions label {
    display: flex;
    align-items: center;
    padding: 1em;
    background-color: #edf8f4;
    /* border-bottom: 1px solid #ddd; */
    cursor: pointer;
    transition: background-color 0.3s;
    margin-top: 3px;
}

#layer-accordions label:hover {
    background-color: #edf8f4; /* Slightly darker on hover */
}

.accordion-header .header-title {
    font-weight: bold;
}

.accordion-header .header-icon {
    font-size: 1.5em;
    transform: rotate(0); /* Arrow pointing down */
    transition: transform 0.3s;
    margin-right: 3px;
}

#layer-accordions input:checked + label .header-icon {
    transform: rotate(180deg); /* Arrow pointing up when section is open */
}

#layer-accordions .content {
    display: none;
    padding: 1em;
    background-color: #edf8f4; /* White background */
    margin-bottom: 2px;
    padding-top: 0px;
}

#layer-accordions input:checked + label + .content {
    display: block;
}

/* Style for the link inside the content */
/* #layer-accordions .content a {
    text-decoration: none;
} */

/* TABs */

#layer-info-title {
    padding: 1em;
    background-color: #f2f2f2;
    margin-top: 3px;
    font-weight: bold;
}

.vue-tool-content-body .nav.nav-tabs {
    margin-top: 5px;
    margin-bottom: 5px;
    --bs-nav-tabs-border-width: 0px;
    display: flex;
    border: 1px solid #cccccc;
    /* position: sticky;
    top: 0px;
    background-color: white;
    z-index: 1; */
}

.vue-tool-content-body .nav .nav-item {
    --bs-nav-tabs-border-width: 0px;
    flex: 1;
}

.vue-tool-content-body .nav .nav-link {
    border-right: 1px solid #cccccc;
    background-color: #ffffff;
    color: #cccccc;
    text-align: center;
    padding: 10px;
}

.vue-tool-content-body .nav .nav-item .active {
    background-color: #1a4435;
    color: white !important;
}

#layerinfo-text {
    padding: 1em;
}

#layerinfo-text p {
    margin: 0px;
}

.bottom-line {
    border-bottom: 1px solid #cccccc;
    padding-top: 1rem;
    padding-bottom: 1rem;
}
</style>

