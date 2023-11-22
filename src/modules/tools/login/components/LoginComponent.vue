<script>
import {mapMutations, mapGetters, mapActions} from "vuex";
import {getComponent} from "../../../../utils/getComponent";
import getters from "../store/gettersLogin";
import mutations from "../store/mutationsLogin";
import ToolTemplate from "../../ToolTemplate.vue";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";

export default {
    name: "LoginComponent",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/Login", Object.keys(getters))
    },
    watch: {
    /**
     * Listens to the active property change.
     * @param {Boolean} isActive Value deciding whether the tool gets activated or deactivated.
     * @returns {void}
     */
        active (isActive) {
            if (isActive) {
                if (!this.isLoggedIn()) {
                    this.openLoginWindow();
                }
            }
        }
    },
    created () {
        this.$on("close", this.closeLoginWindow);
    },
    mounted () {
        this.$nextTick(() => {
            this.initialize();
        });

        this.isLoggedIn();
        setInterval(() => this.isLoggedIn(), 10_000); // check every 10 seconds
    },
    methods: {
        ...mapMutations("Tools/Login", Object.keys(mutations)),
        ...mapActions("Tools/Login", [
            "initialize",
            "logout",
            "checkLoggedIn",
            "getAuthCodeUrl"
        ]),
        translateKeyWithPlausibilityCheck,

        /**
         * Translates the given translationKey or keeps a given text as it is if no translationKey is detected.
         * @param {String} translationKey the value or key to translate, if this is not a translation key, it will return the value as it is
         * @param {Object} [options=null] the options to use for the translation, if given translationKey must be a translation key
         * @returns {String} the translation or the given param as it is
         */
        translate (translationKey, options = null) {
            if (typeof options === "object" && options !== null) {
                return i18next.t(translationKey, options);
            }
            return this.translateKeyWithPlausibilityCheck(translationKey, (v) => i18next.t(v));
        },

        getTitle () {
            return this.translate("common:modules.login.profile") || "Profile";
        },

        /**
         * Returns true if user is logged in, else false
         * @return {Boolean} logged in
         */
        isLoggedIn () {
            this.checkLoggedIn();
            this.setLoginIcon();
            return this.loggedIn;
        },

        /**
         * Opens a login popup and stores retrieved login data into store
         *
         * @return {void}
         */
        async openLoginWindow () {
            let timer = null;

            // open javascript window
            const params = "width=500,height=500,status=no,location=no,menubar=no," +
                    `top=${window.screenY + (window.outerHeight - 500) / 2.5},` +
                    `left=${window.screenX + (window.outerWidth - 500) / 2}`,

                loginPopup = window.open(await this.getAuthCodeUrl(), this.translate("common:modules.login.login"), params);

            // check every x milliseconds if dialog has been closed
            timer = setInterval(() => {
                if (loginPopup.closed) {
                    clearInterval(timer);

                    this.reloadWindow();
                }
            }, 500);
        },

        /**
         * Reload the window if possible.
         * This will show the masterportal with new rights after login or logout.
         *
         * @return {void}
         */
        reloadWindow () {
            if (window?.location) {
                window.location.reload();
            }
        },

        /**
         * Logs out the user by removing all cookies and clearing the store
         * @param {Boolean} [reload = false] if true, the window will be reloaded after logout
         *
         * @return {void}
         */
        logoutButton (reload = false) {
            // close login window
            this.closeLoginWindow();

            this.logout();

            // set icon to reflect login state
            this.setLoginIcon();

            // reload window since it cannot partially update at the moment (TODO)
            if (reload) {
                this.reloadWindow();
            }
        },


        /**
         * Adds a login icon in the search bar
         *
         * @return {void}
         */
        setLoginIcon () {

            let loginTextDesktop, loginItemMobileText, icon;

            const loginIconDesktop = document.querySelector("#navbarMenu .nav-menu.desktop li.nav-item a span[name=login]"),
                loginItemMobileIcon = document.querySelector("#navbarMenu .nav-menu.mobile li span[name=login]");

            // update icon if appropriate (Desktop menu)
            if (loginIconDesktop) {
                // set id for login nav item
                loginIconDesktop.parentElement.parentElement.id = "login";

                loginTextDesktop = loginIconDesktop.parentElement;
                icon = loginIconDesktop.getElementsByTagName("i")[0];

                if (this.loggedIn) {
                    icon.className = this.iconLogged;
                    loginTextDesktop.innerHTML = String(loginIconDesktop.outerHTML) + ` ${this.translate("common:modules.login.logout")} `;
                }
                else {
                    icon.className = this.iconLogin;
                    loginTextDesktop.innerHTML = String(loginIconDesktop.outerHTML) + ` ${this.translate("common:modules.login.login")} `;
                }
            }

            // update icon if appropriate (Mobile menu)
            if (loginItemMobileIcon) {
                loginItemMobileText = loginItemMobileIcon.nextElementSibling;
                icon = loginItemMobileIcon.getElementsByTagName("i")[0];

                if (this.loggedIn) {
                    icon.className = this.iconLogged;
                    loginItemMobileText.innerHTML = this.translate("common:modules.login.logout");
                }
                else {
                    icon.className = this.iconLogin;
                    loginItemMobileText.innerHTML = this.translate("common:modules.login.login");
                }
            }
        },

        /**
         * Closes the window of login by setting store active to false.
         * @pre window is opened
         * @post window is closed
         * @returns {void}
         */
        closeLoginWindow () {
            this.setActive(false);

            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        v-if="active"
        id="login-component"
        :title="getTitle()"
        :icon="iconLogin"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-g-f-i="deactivateGFI"
        class="login-window"
    >
        <template #toolBody>
            <div
                v-show="!screenName && !email"
                class="progress-loader"
            >
                <div class="loader" />
                <span>{{ $t('common:modules.login.progress') }}</span>
            </div>
            <div v-show="screenName">
                <span>{{ translate('common:modules.login.name') }}:</span>
                <span>{{ screenName }}</span>
            </div>
            <div v-show="email">
                <span>{{ translate('common:modules.login.email') }}:</span>
                <span>{{ email }}</span>
            </div>
            <div><p>&nbsp;</p></div>
            <button
                id="logout-button"
                class="btn btn-logout"
                type="button"
                :title="translate('common:modules.login.logout')"
                @click="logoutButton(true)"
            >
                <span class="bootstrap-icon logout-icon">
                    <i
                        id="logout-icon"
                        class="bi-door-closed"
                    /> {{ translate('common:modules.login.logout') }}
                </span>
            </button>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
@import "~variables";
.login-window {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  z-index: 2000;
}
.progress-loader {
  display: flex;
  flex-direction: row;
}
.loader {
  border: 3px solid #f3f3f3; /* Light grey */
  border-top: 3px solid #333333; /* Grey */
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 2s linear infinite;
  display: inline;
  margin-right: 10px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
