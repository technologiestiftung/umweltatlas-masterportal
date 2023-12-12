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
                    <p class="info">
                        Böden sind im wahrsten Sinne des Wortes die Grundlage
                        für unser Leben. Und noch mehr als das: Sie sind
                        Zeitzeugen von Natur- und Kulturgeschichte. Lesen Sie im
                        Themenbereich „Boden“, was das Berliner Erdreich über
                        den Werdegang der Stadt verrät und erfahren Sie, worauf
                        Sie stehen und gehen.
                    </p>
                </div>
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
                    <p class="info">
                        Böden sind im wahrsten Sinne des Wortes die Grundlage
                        für unser Leben. Und noch mehr als das: Sie sind
                        Zeitzeugen von Natur- und Kulturgeschichte. Lesen Sie im
                        Themenbereich „Boden“, was das Berliner Erdreich über
                        den Werdegang der Stadt verrät und erfahren Sie, worauf
                        Sie stehen und gehen.
                    </p>
                </div>
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
                    <p class="info">
                        Böden sind im wahrsten Sinne des Wortes die Grundlage
                        für unser Leben. Und noch mehr als das: Sie sind
                        Zeitzeugen von Natur- und Kulturgeschichte. Lesen Sie im
                        Themenbereich „Boden“, was das Berliner Erdreich über
                        den Werdegang der Stadt verrät und erfahren Sie, worauf
                        Sie stehen und gehen.
                    </p>
                </div>
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
                    <p class="info">
                        Böden sind im wahrsten Sinne des Wortes die Grundlage
                        für unser Leben. Und noch mehr als das: Sie sind
                        Zeitzeugen von Natur- und Kulturgeschichte. Lesen Sie im
                        Themenbereich „Boden“, was das Berliner Erdreich über
                        den Werdegang der Stadt verrät und erfahren Sie, worauf
                        Sie stehen und gehen.
                    </p>
                </div>
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
                    <p class="info">
                        Böden sind im wahrsten Sinne des Wortes die Grundlage
                        für unser Leben. Und noch mehr als das: Sie sind
                        Zeitzeugen von Natur- und Kulturgeschichte. Lesen Sie im
                        Themenbereich „Boden“, was das Berliner Erdreich über
                        den Werdegang der Stadt verrät und erfahren Sie, worauf
                        Sie stehen und gehen.
                    </p>
                </div>
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
                    <p class="info">
                        Böden sind im wahrsten Sinne des Wortes die Grundlage
                        für unser Leben. Und noch mehr als das: Sie sind
                        Zeitzeugen von Natur- und Kulturgeschichte. Lesen Sie im
                        Themenbereich „Boden“, was das Berliner Erdreich über
                        den Werdegang der Stadt verrät und erfahren Sie, worauf
                        Sie stehen und gehen.
                    </p>
                </div>
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
                    <p class="info">
                        Böden sind im wahrsten Sinne des Wortes die Grundlage
                        für unser Leben. Und noch mehr als das: Sie sind
                        Zeitzeugen von Natur- und Kulturgeschichte. Lesen Sie im
                        Themenbereich „Boden“, was das Berliner Erdreich über
                        den Werdegang der Stadt verrät und erfahren Sie, worauf
                        Sie stehen und gehen.
                    </p>
                </div>
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
                    <p class="info">
                        Böden sind im wahrsten Sinne des Wortes die Grundlage
                        für unser Leben. Und noch mehr als das: Sie sind
                        Zeitzeugen von Natur- und Kulturgeschichte. Lesen Sie im
                        Themenbereich „Boden“, was das Berliner Erdreich über
                        den Werdegang der Stadt verrät und erfahren Sie, worauf
                        Sie stehen und gehen.
                    </p>
                </div>
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
                    <p class="info">
                        Böden sind im wahrsten Sinne des Wortes die Grundlage
                        für unser Leben. Und noch mehr als das: Sie sind
                        Zeitzeugen von Natur- und Kulturgeschichte. Lesen Sie im
                        Themenbereich „Boden“, was das Berliner Erdreich über
                        den Werdegang der Stadt verrät und erfahren Sie, worauf
                        Sie stehen und gehen.
                    </p>
                </div>
            </div>
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
    padding: 40px;
    // border-radius: 5px;
    width: 800px;
    max-width: 90%;
    outline: 0;
    background-color: white;
    max-height: 80%;
    overflow: auto;
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

