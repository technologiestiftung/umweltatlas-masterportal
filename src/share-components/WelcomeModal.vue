<script>
export default {
    name: "WelcomeModal",
};
</script>

<template>
    <dialog open>
        <p>Greetings, one and all!</p>
        <form method="dialog" class="grid-container">
            <button class="grid-item" @click="">Boden</button>
            <button class="grid-item">Wasser</button>
            <button class="grid-item">Luft</button>
            <button class="grid-item">Klima</button>
            <button class="grid-item">Biotope</button>
            <button class="grid-item">Nutzung</button>
            <button class="grid-item">Verkehr & Lärm</button>
            <button class="grid-item">Energie</button>
            <button class="grid-item">Mensch</button>
        </form>
    </dialog>
</template>

<style scoped>
.grid-container {
    display: grid;
    grid-template-columns: auto auto auto;
    padding: 10px;
    gap: 10px;
}
.grid-item {
    padding: 10px;
    font-size: 16px;
    text-align: center;
}
</style>
