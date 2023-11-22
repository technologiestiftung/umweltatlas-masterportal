import {expect} from "chai";
import getIconListFromLegendModule from "../../../utils/getIconListFromLegend.js";

describe("getIconListFromLegend", () => {
    it("should return empty object if called with no args", () => {
        expect(getIconListFromLegendModule.getIconListFromLegend()).to.be.deep.equals({});

    });

    it("should return result for type icon", () => {
        let result = null;
        const legendInfo = {
                styleObject: {
                    type: "icon",
                    imagePath: "imagePath/",
                    imageName: "imageName"
                },
                label: "label"
            },
            styleModel = {
                id: "styleModel"
            },
            legendInfoList = [legendInfo];

        result = getIconListFromLegendModule.getIconListFromLegend(legendInfoList, styleModel);
        expect(typeof result).to.be.equals("object");
        expect(result).to.be.deep.equals({label: "imagePath/imageName"});
    });

    it("should return svg for geometryType Point", () => {
        let result = null;
        const legendInfo = {
                geometryType: "Point",
                styleObject: {
                    type: ""
                },
                label: "label"
            },
            styleModel = {
                id: "styleModel"
            },
            legendInfoList = [legendInfo];

        result = getIconListFromLegendModule.getIconListFromLegend(legendInfoList, styleModel);
        expect(typeof result).to.be.equals("object");
        expect(result.label.startsWith("<svg")).to.be.true;
    });

    it("should return svg for geometryType LineString", () => {
        let result = null;
        const legendInfo = {
                geometryType: "LineString",
                styleObject: {
                    type: ""
                },
                label: "label"
            },
            styleModel = {
                id: "styleModel"
            },
            legendInfoList = [legendInfo];

        result = getIconListFromLegendModule.getIconListFromLegend(legendInfoList, styleModel);
        expect(typeof result).to.be.equals("object");
        expect(result.label.startsWith("<svg")).to.be.true;
    });

    it("should return svg for geometryType Polygon", () => {
        let result = null;
        const legendInfo = {
                geometryType: "Polygon",
                styleObject: {
                    type: ""
                },
                label: "label"
            },
            styleModel = {
                id: "styleModel"
            },
            legendInfoList = [legendInfo];

        result = getIconListFromLegendModule.getIconListFromLegend(legendInfoList, styleModel);
        expect(typeof result).to.be.equals("object");
        expect(result.label.startsWith("<svg")).to.be.true;
    });
});
