import fs from "fs";
const data = JSON.parse(fs.readFileSync("./out/services.json", "utf8"));
import servicesMasterLight from "./services-internet-masterportallight.js";
function findObjectByIds(objects, targetId) {
    // Use the find method to locate the first object whose 'ids' array includes the targetId
    return objects.find((object) => object.id.includes(targetId));
}

const newServices = [];

data.forEach((el) => {
    const dataToKeep = {
        ...(el?.infoURL && { infoURL: el.infoURL }),
        ...(el?.download && { download: el.download }),
        ...(el?.contact && { contact: el.contact }),
    };
    // console.log(dataToKeep);

    const newServiceData = findObjectByIds(servicesMasterLight, el.id);

    if (!newServiceData) {
        newServices.push(el);
    } else {
        newServices.push({
            ...newServiceData,
            ...dataToKeep,
        });
    }
});

fs.writeFile(
    "./out/servicesUpdated.json",
    JSON.stringify(newServices),
    (err) => {
        console.log("!DONE!");
    }
);

