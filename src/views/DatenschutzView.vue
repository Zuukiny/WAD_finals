<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
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
      <h1>Privacy Policy</h1>
    </header>

    <main>
      <section>
        <h2>1. Data Controller</h2>
        <p>
          Marlon Cheshmei - see the Legal Notice.
          This project is a non-commercial student project.
        </p>
      </section>

      <section>
        <h2>2. What Data Is Processed</h2>
        <p>
          <strong>Login Data:</strong> Fixed login credentials (username and
          password) are stored in a MongoDB database for using the application.
          No third-party user registration is available.
        </p>
        <p>
          <strong>Location Reports:</strong> Reports created by administrators
          (title, description, address, category, and, where applicable, a
          photo) are stored in the same database. Photos are additionally
          stored as files on the server.
        </p>
        <p>
          <strong>Session Data:</strong> After logging in, the authenticated
          user is stored locally in the browser (sessionStorage) so that the
          session persists after a page refresh. This data never leaves the
          browser and is deleted when the browser tab is closed or the user
          logs out.
        </p>
      </section>

      <section>
        <h2>3. External Services</h2>
        <p>
          Map tiles are provided by <strong>OpenStreetMap</strong>. The
          <strong>Nominatim</strong> geocoding API is used to convert addresses
          into geographic coordinates (both services are operated by the
          OpenStreetMap Foundation). As part of this process, the IP address of
          the requesting device is transmitted to these services. No third-party
          cookies or tracking mechanisms are used.
        </p>
      </section>

      <section>
        <h2>4. Purpose of Data Processing</h2>
        <p>
          The collected data is processed solely for the operation of this
          application as part of this student project.
        </p>
      </section>

      <section>
        <h2>5. Data Retention</h2>
        <p>
          Data is retained for the duration of the project or until it is
          manually deleted by the administrators.
        </p>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>
          As this is a non-public student project using predefined test
          accounts, the data processing does not concern external third
          parties. If you have any questions, please contact the address
          provided in the Legal Notice.
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
  margin: 0.4rem 0;
}

@media (max-width: 480px) {
  .legal-screen {
    padding: 1.5rem 1rem;
  }
}
</style>
