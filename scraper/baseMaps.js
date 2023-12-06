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

    {
        id: "k_luftbild1928:0",
        name: "Luftbildplan 1928",
        name_lang: "Luftbildplan 1928 (Luftbilder 1928, Maßstab 1:4 000)",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild1928",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild1928?layerID=0",
        datasets: [
            {
                md_name: "Luftbilder 1928, Maßstab 1:4 000",
                md_id: "6b746499-7354-3a3a-aa70-60e1fb37f993",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/2ca8d68f-afc1-3111-82c2-a376d4141620",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "50",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild1953:0",
        name: "Luftbilder 1953",
        name_lang: "Luftbilder 1953 (Luftbilder 1953, Maßstab 1:22 000)",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild1953",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild1953?layerID=0",
        datasets: [
            {
                md_name: "Luftbilder 1953, Maßstab 1:22 000",
                md_id: "91d4b7c9-d3b0-3a2f-bab4-33bc47ca52b8",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/20021817-2ce2-367c-b214-e00b274b9894",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "1000",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2002:0",
        name: "Digitale Schwarz-Weiß-Orthophotos 2002 (DOP40PAN)",
        name_lang:
            "Digitale Schwarz-Weiß-Orthophotos 2002 (DOP40PAN) (Digitale Schwarz-Weiß-Orthophotos 2002 (DOP40PAN))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2002",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2002?layerID=0",
        datasets: [
            {
                md_name: "Digitale Schwarz-Weiß-Orthophotos 2002 (DOP40PAN)",
                md_id: "5aaeead0-f953-36c7-ad57-8eda40a1a9ee",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/5185f87c-b230-3efa-a33d-6416a8025c25",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "200",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "luftbild2004:0",
        name: "Digitale farbige Orthophotos 2004 (DOP25RGB)",
        name_lang:
            "Digitale farbige Orthophotos 2004 (DOP25RGB) (Digitale farbige Orthophotos 2004 (DOP25RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/luftbild2004",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/luftbild2004?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2004 (DOP25RGB)",
                md_id: "7980cb5c-2c9a-3649-9e47-6b6413d2d88e",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/5fcb71f3-c68e-3b6c-b5fe-33436db16ec4",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "200",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "luftbild2006:0",
        name: "Digitale Schwarz-Weiß-Orthophotos 2006 (DOP15PAN)",
        name_lang:
            "Digitale Schwarz-Weiß-Orthophotos 2006 (DOP15PAN) (Digitale Schwarz-Weiß-Orthophotos 2006 (DOP15PAN))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/luftbild2006",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/luftbild2006?layerID=0",
        datasets: [
            {
                md_name: "Digitale Schwarz-Weiß-Orthophotos 2006 (DOP15PAN)",
                md_id: "b97ca27d-61cc-355b-8905-79ed0c4aa9b7",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/8eff8bd8-9fc8-3a37-869e-7b2f01acac0a",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "200",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2007:0",
        name: "Digitale farbige Orthophotos 2007 (DOP20RGB)",
        name_lang:
            "Digitale farbige Orthophotos 2007 (DOP20RGB) (Digitale farbige Orthophotos 2007 (DOP20RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2007",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2007?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2007 (DOP20RGB)",
                md_id: "de32d147-d803-3340-a4be-ed0119b0bc48",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/06d554c7-09bb-35c3-9493-53ade0369c47",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "200",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2009_20:0",
        name: "Digitale farbige Orthophotos 2009 (DOP20RGB)",
        name_lang:
            "Digitale farbige Orthophotos 2009 (DOP20RGB) (Digitale farbige Orthophotos 2009 (DOP20RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2009_20",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2009_20?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2009 (DOP20RGB)",
                md_id: "8f70d448-6df2-3181-8944-eb27cf582743",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/536be580-576d-3245-a010-b39916822f72",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "200",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2010_rgb:0",
        name: "Digitale farbige Orthophotos 2010 (DOP20RGB)",
        name_lang:
            "Digitale farbige Orthophotos 2010 (DOP20RGB) (Digitale farbige Orthophotos 2010 (DOP20RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2010_rgb",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2010_rgb?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2010 (DOP20RGB)",
                md_id: "6213d0b9-00ff-36e7-89e4-0b72d846c66a",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/f06f69ae-46a1-3b61-9892-2e8f42f52564",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "200",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2011_20:0",
        name: "Digitale farbige Orthophotos 2011 (DOP20RGB)",
        name_lang:
            "Digitale farbige Orthophotos 2011 (DOP20RGB) (Digitale farbige Orthophotos 2011 (DOP20RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2011_20",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2011_20?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2011 (DOP20RGB)",
                md_id: "72928789-80fe-3e71-93c4-ba16f46f1b75",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/f1a47301-edec-31c1-9c39-d572e28ad4fb",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "50",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2013:0",
        name: "Digitale farbige Trueorthophotos 2013",
        name_lang:
            "Digitale farbige Trueorthophotos 2013 (Digitale farbige Trueorthophotos 2013)",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2013",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2013?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Trueorthophotos 2013",
                md_id: "1b214cf5-ef58-3ca9-975a-ebbf9ffa568f",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/5e435015-ad8a-37dd-82c1-066f54d1f7b5",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "200",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2014:0",
        name: "Digitale farbige Orthophotos 2014 (DOP20RGB)",
        name_lang:
            "Digitale farbige Orthophotos 2014 (DOP20RGB) (Digitale farbige Orthophotos 2014 (DOP20RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2014",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2014?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2014 (DOP20RGB)",
                md_id: "e7b59db7-553a-3a47-93a5-70889f6dc77b",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/d1683f87-d577-3934-8d76-171c6cf9ed34",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "50",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2) der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2015_rgb:0",
        name: "Luftbilder 2015 (Orthophotos)",
        name_lang:
            "Luftbilder 2015 (Orthophotos) (Digitale farbige Orthophotos 2015 (DOP20RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2015_rgb",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2015_rgb?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2015 (DOP20RGB)",
                md_id: "f81f42b6-0d14-353c-84dc-fafd55962710",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/48d464e2-56bb-3fe0-b7bc-f0100e70c1ac",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "50",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2016_rgb:0",
        name: "Digitale farbige Orthophotos 2016 (DOP20RGB)",
        name_lang:
            "Digitale farbige Orthophotos 2016 (DOP20RGB) (Digitale farbige Orthophotos 2016 (DOP20RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2016_rgb",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2016_rgb?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2016 (DOP20RGB)",
                md_id: "eed6a16b-f86d-3ebe-8c92-0c7d32a6b465",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/768430c2-8b3e-3b01-b4ee-8b33ed658282",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "50",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2017_rgb:0",
        name: "Digitale farbige Orthophotos 2017 (DOP20RGB)",
        name_lang:
            "Digitale farbige Orthophotos 2017 (DOP20RGB) (Digitale farbige Orthophotos 2017 (DOP20RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2017_rgb",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2017_rgb?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2017 (DOP20RGB)",
                md_id: "947b53e4-f014-3f12-b7a9-f6438f29223e",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/bbfa1d84-605e-3d5e-8acb-303cd58cc34a",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "50",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2) der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2018_rgb:0",
        name: "Digitale farbige Orthophotos 2018 (DOP20RGB)",
        name_lang:
            "Digitale farbige Orthophotos 2018 (DOP20RGB) (Digitale farbige Orthophotos 2018 (DOP20RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2018_rgb",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2018_rgb?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2018 (DOP20RGB)",
                md_id: "6cc4151c-7031-4c73-b3a6-43b27b2e3b62",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/9efcc42e-09f6-3d7c-8b23-5d98487ff00d",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "50",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2) der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2019_rgb:0",
        name: "Digitale farbige Orthophotos 2019 (DOP20RGB)",
        name_lang:
            "Digitale farbige Orthophotos 2019 (DOP20RGB) (Digitale farbige Orthophotos 2019 (DOP20RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2019_rgb",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2019_rgb?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2019 (DOP20RGB)",
                md_id: "5b664b77-ca23-41cc-aba6-312245b559dd",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/2676bed6-175f-3f17-a3c3-51057db1f8ba",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "50",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2) der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2020_rgb:0",
        name: "Digitale farbige Orthophotos 2020 (DOP20RGB)",
        name_lang:
            "Digitale farbige Orthophotos 2020 (DOP20RGB) (Digitale farbige Orthophotos 2020 (DOP20RGB))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2020_rgb",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2020_rgb?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2020 (DOP20RGB)",
                md_id: "95a1430d-04e9-434b-ba1e-9cd9f0e673b6",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/7f3ee07f-c3e5-3d91-9420-5e173aafd4ff",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "50",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2021_rgb:0",
        name: "Digitale farbige Orthophotos 2021 (DOP20RGBI)",
        name_lang:
            "Digitale farbige Orthophotos 2021 (DOP20RGBI) (Digitale farbige Orthophotos 2021 (DOP20RGBI))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2021_rgb",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2021_rgb?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige Orthophotos 2021 (DOP20RGBI)",
                md_id: "ef0c8276-78af-4444-969f-d01bb7d3c841",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/68064e68-7ff3-3593-a0fb-f0f6d7075668",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "200",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "k_luftbild2022_true_rgbi:0",
        name: "Digitale farbige TrueOrthophotos 2022 (DOP20RGBI)",
        name_lang:
            "Digitale farbige TrueOrthophotos 2022 (DOP20RGBI) (Digitale farbige TrueOrthophotos 2022 (DOP20RGBI))",
        crs: "EPSG:25833",
        url: "https://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2022_true_rgbi",
        typ: "WMS",
        gfiAttributes: "ignore",
        layers: "0",
        legend: "https://fbinter.stadt-berlin.de/fb/wms/legend/senstadt/k_luftbild2022_true_rgbi?layerID=0",
        datasets: [
            {
                md_name: "Digitale farbige TrueOrthophotos 2022 (DOP20RGBI)",
                md_id: "bf885681-6daa-4ce7-8bc5-15fdba32f268",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/38140514-3995-3513-82e5-753bd246ae31",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        minScale: "200",
        maxScale: "210000",
        format: "image/png",
        version: "1.3.0",
        featureCount: "5",
        gfiTheme: "default",
        transparent: true,
        singleTile: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die  Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2)  der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]".',
    },
    {
        id: "truedop_2023:truedop_2023:GDIBE:25833",
        name: "Digitale farbige TrueOrthophotos 2023 (DOP20RGBI)",
        name_lang:
            "Digitale farbige TrueOrthophotos 2023 (DOP20RGBI) (Digitale farbige TrueOrthophotos 2023 (DOP20RGBI))",
        url: "https://gdi.berlin.de/services/wmts/truedop_2023",
        capabilitiesUrl:
            "https://gdi.berlin.de/services/wmts/truedop_2023?request=getcapabilities&service=WMTS&version=1.0.0",
        typ: "WMTS",
        layers: "truedop_2023",
        tileMatrixSet: "GDIBE:25833",
        datasets: [
            {
                md_id: "c68a287b-7ad0-4cc9-87f5-2cffebaf7113",
                rs_id: "https://registry.gdi-de.org/id/de.be.csw/1d0094bb-ee61-385a-8fc4-5ba731069b85",
                csw_url: "https://gdi.berlin.de/geonetwork/srv/ger/csw",
            },
        ],
        optionsFromCapabilities: true,
        layerAttribution:
            'Für die Nutzung der Daten ist die Datenlizenz Deutschland - Namensnennung - Version 2.0 anzuwenden. Die Lizenz ist über https://www.govdata.de/dl-de/by-2-0 abrufbar. Der Quellenvermerk gemäß (2) der Lizenz lautet "Geoportal Berlin / [Titel des Datensatzes]"',
    },
];

