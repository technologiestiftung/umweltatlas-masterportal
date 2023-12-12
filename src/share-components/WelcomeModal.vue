<script>
export default {
    name: "WelcomeModal",
    data() {
        return {
            showModal: true,
        };
    },
    methods: {
        closeModal() {
            this.showModal = false;
        },
        close(event, folderId) {
            window.zoomToDesktopTopicTreeFolder(folderId);
            event.preventDefault();
            event.stopImmediatePropagation();
            this.closeModal();
        },
    },
};
</script>

<template>
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <button
                class="close-button"
                @click="closeModal"
                title="close modal"
            >
                <span class="bootstrap-icon d-sm-none d-md-inline-block"
                    ><i class="bi-x-lg"></i
                ></span>
            </button>

            <div class="row">
                <div class="col-md-4">
                    <button @click="close($event, 'Boden2')">
                        <span class="img-wrapper">
                            <span class="img-text">
                                <span
                                    class="bootstrap-icon d-sm-none d-md-inline-block"
                                    ><i class="bi-arrow-right-short"></i
                                ></span>
                                Boden
                            </span>
                            <img
                                loading="lazy"
                                src="./welcome-img/fotolia_40771294_subscription_monthly_xxl.jpg"
                            />
                        </span>
                    </button>
                    <p class="img-copyright">Bild: Samiylenko - Forolia.com</p>
                    <!-- <p class="info">
                        Böden sind im wahrsten Sinne des Wortes die Grundlage
                        für unser Leben. Und noch mehr als das: Sie sind
                        Zeitzeugen von Natur- und Kulturgeschichte. Lesen Sie im
                        Themenbereich „Boden“, was das Berliner Erdreich über
                        den Werdegang der Stadt verrät und erfahren Sie, worauf
                        Sie stehen und gehen.
                    </p> -->
                </div>
                <div class="col-md-4">
                    <button @click="close($event, 'Wasser77')">
                        <span class="img-wrapper">
                            <span class="img-text">
                                <span
                                    class="bootstrap-icon d-sm-none d-md-inline-block"
                                    ><i class="bi-arrow-right-short"></i
                                ></span>
                                Wasser
                            </span>
                            <img
                                loading="lazy"
                                src="./welcome-img/depositphotos_147902709_xl-2015.jpg"
                            />
                        </span>
                    </button>
                    <p class="img-copyright">
                        Bild: chrissi/ Depositphotos.com
                    </p>
                    <!-- <p class="info">
                        Wie viele Fischarten schwimmen in der Havel? Wo drohen
                        Überschwemmungen? Welche Schadstoffe sind im
                        Landwehrkanal zu finden? Und wo kommt eigentlich das
                        Berliner Trinkwasser her? Hier finden Sie alles, was Sie
                        über das Wasser und Grundwasser in Berlin wissen wollen.
                    </p> -->
                </div>
                <div class="col-md-4">
                    <button @click="close($event, 'Luft344')">
                        <span class="img-wrapper">
                            <span class="img-text">
                                <span
                                    class="bootstrap-icon d-sm-none d-md-inline-block"
                                    ><i class="bi-arrow-right-short"></i
                                ></span>
                                Luft
                            </span>
                            <img
                                loading="lazy"
                                src="./welcome-img/depositphotos_324010502_xl-2015.jpg"
                            />
                        </span>
                    </button>
                    <p class="img-copyright">
                        Bild: yskandag / depositphotos.com
                    </p>
                    <!-- <p class="info">
                        Berlin ist bunt: Grüne Parkanlagen wechseln sich ab mit
                        quirligen Kiezen, mittendurch fließt der Verkehr. Wo
                        viel Leben ist, gibt es häufig auch „dicke Luft“. Wie
                        andere Großstädte setzt sich Berlin seit langem gegen
                        Luftschadstoffe ein. Informieren Sie sich hier über die
                        Luftqualität der Stadt.
                    </p> -->
                </div>
                <div class="col-md-4">
                    <button @click="close($event, 'Klima465')">
                        <span class="img-wrapper">
                            <span class="img-text">
                                <span
                                    class="bootstrap-icon d-sm-none d-md-inline-block"
                                    ><i class="bi-arrow-right-short"></i
                                ></span>
                                Klima
                            </span>
                            <img
                                loading="lazy"
                                src="./welcome-img/fotolia_26968330_subscription_monthly_l.jpg"
                            />
                        </span>
                    </button>
                    <p class="img-copyright">Bild: © alm1982 - Fotolia.com</p>
                    <!-- <p class="info">
                        Lufttemperatur, Feuchtigkeit, die Lage, Bebauung,
                        Grünflächen und noch ein paar Dinge mehr sind
                        entscheidend für das Stadtklima. Wie sich das Klima und
                        seine entscheidenden Faktoren in Berlin verhalten und
                        wie ihre Wirkung auf den Menschen positiv beeinflusst
                        werden kann, erfahren Sie hier.
                    </p> -->
                </div>
                <div class="col-md-4">
                    <button @click="close($event, 'Biotope759')">
                        <span class="img-wrapper">
                            <span class="img-text">
                                <span
                                    class="bootstrap-icon d-sm-none d-md-inline-block"
                                    ><i class="bi-arrow-right-short"></i
                                ></span>
                                Biotope
                            </span>
                            <img
                                loading="lazy"
                                src="./welcome-img/fotolia_42033806_subscription_monthly_xxl.jpg"
                            />
                        </span>
                    </button>
                    <p class="img-copyright">Bild: © photocreo - Fotolia.com</p>
                    <!-- <p class="info">
                        Es grünt so grün … – Machen Sie sich im Themenbereich
                        „Biotope“ ein Bild davon, wie es um die Grünflächen
                        Berlins steht. Lesen Sie außerdem, welche Faktoren sich
                        positiv wie negativ auf Lebensräume für Pflanzen und
                        Tiere auswirken – und wie die Biotope in Berlin
                        geschützt werden können.
                    </p> -->
                </div>
                <div class="col-md-4">
                    <button @click="close($event, 'Nutzung803')">
                        <span class="img-wrapper">
                            <span class="img-text">
                                <span
                                    class="bootstrap-icon d-sm-none d-md-inline-block"
                                    ><i class="bi-arrow-right-short"></i
                                ></span>
                                Nutzung
                            </span>
                            <img
                                loading="lazy"
                                src="./welcome-img/depositphotos_182915374_xl-2015_fransz.jpg"
                            />
                        </span>
                    </button>
                    <p class="img-copyright">Bild: depositphotos - fransz</p>
                    <!-- <p class="info">
                        Die Stadtstruktur Berlins ist so vielfältig wie das
                        Leben in den Kiezen selbst. Mal dichte und mal
                        aufgelockerte Bebauung, mal viele Einwohner pro Hektar
                        und mal wenige.
                    </p> -->
                </div>
                <div class="col-md-4">
                    <button @click="close($event, 'VerkehrLrm891')">
                        <span class="img-wrapper">
                            <span class="img-text">
                                <span
                                    class="bootstrap-icon d-sm-none d-md-inline-block"
                                    ><i class="bi-arrow-right-short"></i
                                ></span>
                                Verkehr / Lärm
                            </span>
                            <img
                                loading="lazy"
                                src="./welcome-img/fotolia_46452680_subscription_monthly_xl.jpg"
                            />
                        </span>
                    </button>
                    <p class="img-copyright">
                        Bild: berlinphotos030 - Fotolia.com
                    </p>
                    <!-- <p class="info">
                        Flugzeuge, Bahn und Bus oder der eigene Pkw bringen die
                        Menschen heute immer schneller und bequemer von A nach
                        B. Doch dabei entstehen Lärm und Emissionen, die der
                        Gesundheit und Umwelt schaden können. Lesen Sie hier,
                        wie sich der Berliner Verkehr und Lärm in den
                        vergangenen Jahren entwickelt hat.
                    </p> -->
                </div>
                <div class="col-md-4">
                    <button @click="close($event, 'Energie1044')">
                        <span class="img-wrapper">
                            <span class="img-text">
                                <span
                                    class="bootstrap-icon d-sm-none d-md-inline-block"
                                    ><i class="bi-arrow-right-short"></i
                                ></span>
                                Energie
                            </span>
                            <img
                                loading="lazy"
                                src="./welcome-img/fotolia_35979355_subscription_monthly_xl.jpg"
                            />
                        </span>
                    </button>
                    <p class="img-copyright">
                        Bild: Thorsten Schier - Fotolia.com
                    </p>
                    <!-- <p class="info">
                        Strom und Heizwärme werden in Berlin zu großen Teilen
                        mit fossilen Energieträgern erzeugt. Hier erfahren Sie
                        zum Beispiel, an welchen Orten in der Stadt die Anlagen
                        mit den höchsten CO₂-Emissionen stehen und welche
                        Gebiete mit Fernwärme versorgt werden.
                    </p> -->
                </div>
                <div class="col-md-4">
                    <button @click="close($event, 'Mensch1080')">
                        <span class="img-wrapper">
                            <span class="img-text">
                                <span
                                    class="bootstrap-icon d-sm-none d-md-inline-block"
                                    ><i class="bi-arrow-right-short"></i
                                ></span>
                                Mensch
                            </span>
                            <img
                                loading="lazy"
                                src="./welcome-img/depositphotos_15819245_xl-2015.jpg"
                            />
                        </span>
                    </button>
                    <p class="img-copyright">
                        Bild: Kuzmafoto/depositphoto.com
                    </p>
                    <!-- <p class="info">
                        Von Friedrichshain-Kreuzberg bis Marzahn-Hellersdorf: Im
                        Themenbereich „Mensch“ erfahren Sie, wie es um die
                        Lebensqualität in den Berliner Bezirken bestellt ist und
                        welche Faktoren diese besonders beeinflussen
                    </p> -->
                </div>
            </div>
            <p class="info-text">
                Das Umweltatlas-Geoportal ist die Kartenzentrierte Erweiterung
                des
                <a href="https://www.berlin.de/umweltatlas/" target="_blank"
                    >Umweltatlas</a
                >
            </p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
// @import "~/css/mixins.scss";
// uatlas_green

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    position: relative;
    background-color: #f7f7f7;
    padding: 60px;
    // border-radius: 5px;
    width: 800px;
    max-width: 90%;
    outline: 0;
    background-color: white;
    max-height: 80%;
    overflow: auto;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    overflow-x: hidden;
}

@media only screen and (max-width: 600px) {
    .modal-content {
        padding: 20px;
    }

    .row {
        margin-top: 30px;
    }
}

.info-text {
    font-size: 15px;
    color: #666666;
    text-align: center;
    margin-top: 1em;
}

.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    background: none;
    font-size: 20px;
    cursor: pointer;
}

.row {
    // margin-top: 30px;

    .col-md-4 {
        margin-bottom: 10px;
    }

    .img-wrapper {
        position: relative;
        height: fit-content;
        display: inherit;

        .img-text {
            position: absolute;
            background-color: black;
            color: white;
            font-size: 17px;
            padding: 3px 10px;

            span {
                font-size: 25px;
            }
        }

        img {
            width: 100%;
            // max-height: 150px;
        }
    }

    .img-copyright {
        text-align: left;
        font-size: 12px;
        color: #999;
    }

    p.info {
        font-size: 15px;
        color: #333333;
    }

    button {
        // This removes styles added by default to button elements.
        // For when something should semantically be a button,
        // but isn't buttony in appearance.
        background-color: transparent;
        border: none;
        margin: 0;
        padding: 0;
        text-align: inherit;
        font: inherit;
        border-radius: 0;
        appearance: none; // Just in case we missed anything.
    }

    button {
        border-top: 5px solid black;
    }

    button:hover {
        border-color: $uatlas_green;
        .img-text {
            background-color: $uatlas_green;
        }
    }
}
</style>

