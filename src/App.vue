<template>
    <router-view></router-view>
</template>

<script setup>
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&display=swap');

body {
    @apply bg-neutral-900 text-white text-xl;
    font-family: 'Poppins', sans-serif;
}

/* width */
::-webkit-scrollbar {
    width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
    background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: #0284c7
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
    background: #0073ac;
}
</style>