/**
 * Handles uiStyle.
 */
export default {
    /**
     * @property {String} uiStyle="DEFAULT" Controls the layout of the controls.
     */
    uiStyle: "DEFAULT",
    /**
     * Getter for uiStyle
     * @returns {String} uiStyle
     */
    getUiStyle: function () {
        return this.uiStyle;
    },
    /**
     * Setter for uiStyle
     * @param {String} value uiStyle
     * @returns {void}
     */
    setUiStyle: function (value) {
        this.uiStyle = value;
    }
};
