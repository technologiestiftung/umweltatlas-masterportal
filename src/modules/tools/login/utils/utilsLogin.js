import Cookie from "./utilsCookies";
import OIDC from "./utilsOIDC";
import AxiosUtils from "./utilsAxios";

/**
 * This function is used to intercept the masterportal load to
 * - check for oidc GET parameters
 * - set the oidc token into cookies, i.e. login the user
 * - add interceptors to axios, XHR, and fetch
 *
 * @return {Boolean|String} login message if parameters exist, else false
 */
export function handleLoginParameters () {

    if (!Object.prototype.hasOwnProperty.call(Config, "login")) {
        return false;
    }

    /**
     * Perform oidc login, if url parameter is present
     */
    const urlParams = new URLSearchParams(window.location.search);

    // Check if the server returned an error string
    if (urlParams.has("error")) {
        const error = urlParams.get("error"),
            error_description = urlParams.get("error_description");

        return "<h1>" + error + "</h1><p>" + error_description + "</p>";
    }

    // If the server returned an authorization code, try to trade it for an access token
    if (urlParams.has("code")) {
        let response = null;

        const config = Config.login,
            code = urlParams.get("code"),
            state = urlParams.get("state"),
            req = OIDC.getToken(config.oidcTokenEndpoint, config.oidcClientId, config.oidcRedirectUri, code);

        // Verify state matches what we set at the beginning
        if (OIDC.getState() !== state) {
            return "<h1>Invalid state</h1>";
        }

        // erase coookies of token does not exist by IDM
        if (req?.status !== 200) {
            // login failed
            OIDC.eraseCookies();
            return "Status: " + req?.status + " " + req?.responseText;
        }

        // put token into cookie, if token exists (login succeeded)
        response = JSON.parse(req.response);

        OIDC.setCookies(response.access_token, response.id_token, response.expires_in, response.refresh_token);

        addAuthenticationBearerInterceptors(config);

        return "user logged in: " + (Cookie.get("email") || "no email defined for user");
    }

    addAuthenticationBearerInterceptors(Config.login);
    return false;
}

/**
 * Check if token is set in cookie.
 * If yes, add axios/fetch interceptors to add authentication token to HTTP requests
 *
 * @param {*} config OIDC configuration parameters
 * @returns {void}
 */
function addAuthenticationBearerInterceptors (config) {
    const token = Cookie.get("token");


    if (token !== undefined) {

        // check token expiry
        const account = OIDC.parseJwt(token),
            expiry = account.exp ? account.exp * 1000 : Date.now() + 10000;

        if (Date.now() > expiry) {
            OIDC.eraseCookies();
        }

        AxiosUtils.addInterceptor(token, config?.interceptorUrlRegex);
    }
}


export default {
    handleLoginParameters
};
