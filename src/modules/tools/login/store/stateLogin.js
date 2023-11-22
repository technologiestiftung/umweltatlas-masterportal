/**
 * User type definition
 * @typedef {Object} LoginState
 * @property {Boolean} active if true, login is rendered
 *
 * @property {Boolean} loggedIn if true, user is logged in
 * @property {String} username the user that is logged in, otherwise undefined
 * @property {String} screenName the user's name that is shown in the frontend or undefined if not logged in
 * @property {String} email the user's email that is shown in the frontend or undefined if not logged in
 * @property {String} accessToken the oidc access token, if logged in, and undefined otherwise
 * @property {String} refreshToken the oidc refresh token, if logged in, and undefined otherwise
 *
 * @property {String}   id - internal id of component
 * @property {String}   name - Module name
 * @property {String}   iconLogin - icon next to title if not logged in
 * @property {String}   iconLogout - icon for logout button
 * @property {String}   iconLogged - icon next to title if logged
 * @property {Boolean}  renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}  resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {Boolean}  deactivateGFI - if true, component activation deactivates gfi component
 */
const state = {
    active: false,

    // login state
    loggedIn: false,
    username: undefined,
    screenName: undefined,
    email: undefined,
    accessToken: undefined,
    refreshToken: undefined,

    // addon state and properties
    id: "login",
    name: "common:menu.tools.login",
    icon: "bi-door-open",
    iconLogin: "bi-door-open",
    iconLogout: "bi-door-closed",
    iconLogged: "bi-person-circle",
    renderToWindow: true,
    resizableWindow: true,
    deactivateGFI: false
};

export default state;
