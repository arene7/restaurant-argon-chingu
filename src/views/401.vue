<script setup>
// import ErrorIllustration from "./components/ErrorIllustration.vue"; // Suponiendo que tienes una ilustración de error
import ArgonButton from "@/components/ArgonButton.vue";
</script>

<template>
  <main class="mt-0 main-content">
    <section>
      <div class="page-header min-vh-100 d-flex align-items-center">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-xl-8 col-lg-10 col-md-12">
              <div class="card card-plain text-center">
                <div class="card-body">
                  <h1 class="display-1 text-danger">401 - No Autorizado</h1>
                  <p class="lead">No tienes permiso para acceder a esta página.</p>
                  <error-illustration class="mb-4" /> <!-- Componente de ilustración de error -->
                  <argon-button
                    class="mt-4"
                    color="success"
                    variant="gradient"
                    size="lg"
                    @click="$router.push('/')"
                  >
                    Regresar al inicio
                  </argon-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.card {
  max-width: 100%;
  margin: auto;
  padding: 3rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.display-1 {
  font-size: 6rem;
}
</style>
