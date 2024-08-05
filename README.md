![](https://img.shields.io/badge/Built%20with%20%E2%9D%A4%EF%B8%8F-at%20Technologiestiftung%20Berlin-blue)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# Umweltatlas Prototyp

This is a functional MVP of a map-based 'Umweltatlas' prototype that is implemented with the master v2 portal software. On the one hand, this is intended to explore the technical feasibility and the effort required to implement the proposals and, on the other hand, to provide an improved decision-making basis for final requirements for an extension or further development of the existing environmental atlas.

Update: It was decided to implement the new map-based 'Umweltatlas' using the masterportal v3 software. The repo can be found [here](https://github.com/technologiestiftung/umweltatlas-masterportal-v3)

_This readme is a work in progress._

## Masterportal

The Masterportal is a tool-kit to create geo web applications based on [OpenLayers](https://openlayers.org), [Vue.js](https://vuejs.org/) and [Backbone.js](https://backbonejs.org). The Masterportal is Open Source Software published under the [MIT License](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/License.txt).

The Masterportal is a project by [Geowerkstatt Hamburg](https://www.hamburg.de/geowerkstatt/).

## Notes

When setting up this had to be removed from devDependencies:
"canvas": "^2.11.0",

## About the scraper

The scraper, scrapes the Umweltaltas website and creates a Masterportal "Themenbaum" that is structured like the website.

Important: The script has been adapted to the Masterportal v3 logic.

Run these scripts in order:

```bash
// the actual scraper
  node index.js
  // corrects names and structur in the Themenbaum
  node sortAndCleanResult.js
  // update services
  node updateServices.js
```

The files we need for the Masterportal v3 are found in the out folder:

configFachdatenSortedAndCleaned.json
and
servicesUpdated.json

## Contributing

Before you create a pull request, write an issue so we can discuss your changes.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Credits

<table>
  <tr>
    <td>
      A project by <a href="https://www.technologiestiftung-berlin.de/">
        <br />
        <br />
        <img width="150" src="https://logos.citylab-berlin.org/logo-technologiestiftung-berlin-de.svg" />
      </a>
    </td>
  </tr>
</table>

## Related Projects

