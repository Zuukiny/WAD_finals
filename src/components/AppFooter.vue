<script setup lang="ts"></script>

<template>
  <footer class="app-footer">
    <RouterLink :to="{ name: 'impressum' }">Impressum</RouterLink>
    <RouterLink :to="{ name: 'datenschutz' }">Datenschutzerklärung</RouterLink>
  </footer>
</template>

<style scoped>
.app-footer {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  padding: 1.25rem 1rem;
  font-size: 0.85rem;
}

.app-footer a {
  color: var(--color-slate);
  text-decoration: none;
}

.app-footer a:hover {
  text-decoration: underline;
}
</style>
