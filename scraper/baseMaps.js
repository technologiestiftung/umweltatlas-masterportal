export default [
    {
        id: "k5_farbe:k5_sw:gdi_be_25833",
        name: "Karte von Berlin (K5 SW-Ausgabe)",
        name_lang:
            "Karte von Berlin (K5 SW-Ausgabe) (Karte von Berlin 1:5000 (K5 - Farbausgabe))",
        url: "https://fbinter.stadt-berlin.de/fb/wmts/senstadt/k5_farbe",
        capabilitiesUrl:
            "https://fbinter.stadt-berlin.de/fb/wmts/senstadt/k5_farbe?request=getcapabilities&service=WMTS&version=1.0.0",
        typ: "WMTS",
        layers: "k5_sw",
        tileMatrixSet: "gdi_be_25833",
        datasets: [
            {
                md_id: "ed9d0b87-ab8b-3db0-9bf3-7f9218cc004a",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/08f2353b-b31f-3c48-abe7-bff6594d61c7",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        optionsFromCapabilities: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2) der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]". Werden auch Daten des Bundeslandes Brandenburg genutzt, ist der Quellenvermerk um den Hinweis "© GeoBasis-DE/LGB (2023), dl-de/by-2-0, Daten geändert" zu ergänzen.',
    },
    {
        id: "k5_farbe:k5_farbe:gdi_be_25833",
        name: "Karte von Berlin (K5)",
        name_lang:
            "Karte von Berlin (K5) (Karte von Berlin 1:5000 (K5 - Farbausgabe))",
        url: "https://fbinter.stadt-berlin.de/fb/wmts/senstadt/k5_farbe",
        capabilitiesUrl:
            "https://fbinter.stadt-berlin.de/fb/wmts/senstadt/k5_farbe?request=getcapabilities&service=WMTS&version=1.0.0",
        typ: "WMTS",
        layers: "k5_farbe",
        tileMatrixSet: "gdi_be_25833",
        datasets: [
            {
                md_id: "ed9d0b87-ab8b-3db0-9bf3-7f9218cc004a",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/08f2353b-b31f-3c48-abe7-bff6594d61c7",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        optionsFromCapabilities: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2) der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]". Werden auch Daten des Bundeslandes Brandenburg genutzt, ist der Quellenvermerk um den Hinweis "© GeoBasis-DE/LGB (2023), dl-de/by-2-0, Daten geändert" zu ergänzen.',
    },
    {
        id: "basemap_raster_farbe",
        name: "basemap.de Web Raster Farbe",
        name_lang: "basemap.de Web Raster Farbe",
        capabilitiesUrl:
            "https://sgx.geodatenzentrum.de/wmts_basemapde/1.0.0/WMTSCapabilities.xml",
        url: "https://sgx.geodatenzentrum.de/wmts_basemapde/1.0.0/",
        typ: "WMTS",
        tileMatrixSet: "DE_EPSG_25833_ADV",
        layers: "de_basemapde_web_raster_farbe",
        optionsFromCapabilities: true,
        crs: "http://www.opengis.net/def/crs/EPSG/0/25833",
        legend: "https://sgx.geodatenzentrum.de/wms_basemapde?format=image%2Fpng&layer=de_basemapde_web_raster_farbe&sld_version=1.1.0&request=GetLegendGraphic&service=WMS&version=1.1.1&styles=",
        layerAttribution: "© basemap.de / BKG (Monat) (Jahr)",
        datasets: [
            {
                md_id: "FE1D2837-ABE0-46B5-9821-BB11BAF22531",
                rs_id: "https://registry.gdi-de.org/id/de.bund.bkg.csw/68f48957-a20f-3d93-bd62-e59ce6bd99fa",
                csw_url: "https://gdk.gdi-de.org/gdi-de/srv/ger/csw",
                show_doc_url:
                    "https://gdz.bkg.bund.de/index.php/default/wmts-basemapde-webraster-wmts-basemapde-webraster.html#",
            },
        ],
    },
    {
        id: "basemap_raster_grau",
        name: "basemap.de Web Raster Grau",
        name_lang: "basemap.de Web Raster Grau",
        capabilitiesUrl:
            "https://sgx.geodatenzentrum.de/wmts_basemapde/1.0.0/WMTSCapabilities.xml",
        url: "https://sgx.geodatenzentrum.de/wmts_basemapde/1.0.0/",
        typ: "WMTS",
        tileMatrixSet: "DE_EPSG_25833_ADV",
        layers: "de_basemapde_web_raster_grau",
        optionsFromCapabilities: true,
        crs: "http://www.opengis.net/def/crs/EPSG/0/25833",
        legend: "https://sgx.geodatenzentrum.de/wms_basemapde?format=image/png&layer=de_basemapde_web_raster_grau&sld_version=1.1.0&request=GetLegendGraphic&service=WMS&version=1.1.1&styles=",
        layerAttribution: "© basemap.de / BKG (Monat) (Jahr)",
        datasets: [
            {
                md_id: "FE1D2837-ABE0-46B5-9821-BB11BAF22531",
                rs_id: "https://registry.gdi-de.org/id/de.bund.bkg.csw/68f48957-a20f-3d93-bd62-e59ce6bd99fa",
                csw_url: "https://gdk.gdi-de.org/gdi-de/srv/ger/csw",
                show_doc_url:
                    "https://gdz.bkg.bund.de/index.php/default/wmts-basemapde-webraster-wmts-basemapde-webraster.html#",
            },
        ],
    },
];

