<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  // Falls back gracefully even if there's no history entry (e.g. direct link)
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'main' })
  }
}
</script>

<template>
  <div class="legal-screen">
    <header>
      <h1>Legal Notice</h1>
    </header>

    <main>
      <section>
        <h2>Information pursuant to Section 5 of the German Telemedia Act (TMG)</h2>
        <p>
          This project is a student assignment developed as part of the
          "Web Application Development" course at HTW Berlin during the
          Summer Semester 2026. It is intended solely for educational and
          demonstration purposes and is not used commercially.
        </p>
        <p>
          Marlon Cheshmei<br />
          c/o HTW Berlin<br />
          Wilhelminenhofstraße 75A<br />
          12459 Berlin<br />
          Germany
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Email: zgc.zuukiny@gmail.com
        </p>
      </section>

      <section>
        <h2>Responsible for Content pursuant to Section 18 (2) MStV</h2>
        <p>
          Marlon Cheshmei, address as above.
        </p>
      </section>

      <section>
        <h2>Disclaimer</h2>
        <p>
          The locations published on this platform are submitted by users.
          No guarantee is given regarding the accuracy, completeness, or
          timeliness of the information provided.
        </p>
      </section>
    </main>

    <button class="btn btn-secondary" @click="goBack">Back</button>
  </div>
</template>

<style scoped>
.legal-screen {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

header {
  margin-bottom: 1.5rem;
}

section {
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
}

p {
  color: var(--color-slate);
  line-height: 1.5;
}

@media (max-width: 480px) {
  .legal-screen {
    padding: 1.5rem 1rem;
  }
}
</style>
