import {expect} from "chai";
import {translate} from "../../../parametricUrl/translator";

describe("src/utils/parametricUrl/urlParamsTranslator.js", () => {
    describe("translate", () => {
        it("translate kmlimport to Tools/FileImport/active", async () => {
            const key = "isinitopen",
                value = "kmlimport",

                entry = await translate(key, value);

            expect(entry.key).to.be.equals("Tools/FileImport/active");
            expect(entry.value).to.be.equals(true);
        });
        it("translate isinitopen=fileimport to Tools/Fileimport/active", async () => {
            const key = "isinitopen",
                value = "fileimport",

                entry = await translate(key, value);

            expect(entry.key).to.be.equals("Tools/fileimport/active");
            expect(entry.value).to.be.equals(true);
        });
        it("translate startupmodul=draw to Tools/draw/active", async () => {
            const key = "startupmodul",
                value = "draw",

                entry = await translate(key, value);

            expect(entry.key).to.be.equals("Tools/draw/active");
            expect(entry.value).to.be.equals(true);
        });
        it("translate multiple mdIds", async () => {
            const key = "mdId",
                value = "6520CBEF-D2A6-11D5-88C8-000102DCCF41,5262159C-D358-11D5-88C8-000102DCCF41,055D40D0-13F4-46EB-BEDF-4232CA4F3B32",

                entry = await translate(key, value);

            expect(entry.key).to.be.equals("Maps/mdId");
            expect(entry.value).to.be.equals("6520CBEF-D2A6-11D5-88C8-000102DCCF41,5262159C-D358-11D5-88C8-000102DCCF41,055D40D0-13F4-46EB-BEDF-4232CA4F3B32");
        });
        it("translate a single mdId", async () => {
            const key = "mdId",
                value = "5262159C-D358-11D5-88C8-000102DCCF41",

                entry = await translate(key, value);

            expect(entry.key).to.be.equals("Maps/mdId");
            expect(entry.value).to.be.equals("5262159C-D358-11D5-88C8-000102DCCF41");
        });


    });
});
