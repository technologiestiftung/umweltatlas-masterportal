import {expect} from "chai";
import {interpretLinebreaks} from "../../../gfi/interpretLinebreaks";

describe("interpretLinebreaks", () => {
    it("does not change objects without CR/LF linebreaks", () => {
        const properties = {
            property: "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?~千"
        };

        expect(interpretLinebreaks(properties)).to.eql(properties);
    });

    it("turns CR/LF into Masterportal style GFI separators ('|')", () => {
        const properties = {
            property: "new\nline\rcarriage\r\nreturn"
        };

        expect(interpretLinebreaks(properties)).to.eql({
            property: "new|line|carriage|return"
        });
    });

    it("forwards arbitrary non-object inputs to output", () => {
        expect(interpretLinebreaks(undefined)).to.equal(undefined);
        expect(interpretLinebreaks(null)).to.equal(null);
        expect(interpretLinebreaks(5)).to.equal(5);
    });
});
