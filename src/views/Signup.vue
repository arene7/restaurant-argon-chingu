<script setup>
import { ref, onBeforeUnmount, onBeforeMount } from "vue";
import { useStore } from "vuex";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { useRouter } from "vue-router"; // Importar useRouter
import Navbar from "@/examples/PageLayout/Navbar.vue";
import AppFooter from "@/examples/PageLayout/Footer.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const body = document.getElementsByTagName("body")[0];
const store = useStore();
const router = useRouter(); // Instanciar el router

const email = ref("");
const password = ref("");
const role = ref("");

const registerUser = async () => {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    const db = getFirestore();
    const userData = {
      email: email.value,
      role: role.value,
      status: 'off', // Añadir campo status por defecto
      createdAt: new Date()
    };

    await setDoc(doc(db, "users", user.uid), userData);

    // Mostrar alerta y redirigir
    alert("¡Usuario registrado con éxito!");
    router.push("/signin");
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    alert("Registro fallido: " + error.message);
  }
};

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  store.state.showNavbar = false;
  store.state.showSidenav = false;
  store.state.showFooter = false;
  body.classList.remove("bg-gray-100");
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});
</script>

<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <div class="col-12">
        <navbar isBtn="bg-gradient-light" />
      </div>
    </div>
  </div>
  <main class="main-content mt-0">
    <div
      class="page-header align-items-start min-vh-50 pt-5 pb-11 m-3 border-radius-lg"
      style="background-image: url(&quot;https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signup-cover.jpg&quot;); background-position: top;"
    >
      <span class="mask bg-gradient-dark opacity-6"></span>
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-5 text-center mx-auto">
            <h1 class="text-white mb-2 mt-5">¡Bienvenido!</h1>
            <p class="text-lead text-white">
              Utiliza este formulario impresionante para registrarte y comenzar a disfrutar de nuestra aplicación de forma gratuita.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row mt-lg-n10 mt-md-n11 mt-n10 justify-content-center">
        <div class="col-xl-4 col-lg-5 col-md-7 mx-auto">
          <div class="card z-index-0">
            <div class="card-header text-center pt-4">
              <h5>Registrarse con</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="registerUser">
                <argon-input
                  v-model="email"
                  id="email"
                  type="email"
                  placeholder="Correo electrónico"
                  aria-label="Correo electrónico"
                />
                <argon-input
                  v-model="password"
                  id="password"
                  type="password"
                  placeholder="Contraseña"
                  aria-label="Contraseña"
                />
                <div class="form-group">
                  <label for="role" class="form-label">Selecciona tu rol:</label>
                  <select v-model="role" class="form-select" required>
                    <option value="" disabled selected>Selecciona tu rol</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Cajero">Cajero</option>
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Mesero">Mesero</option>
                  </select>
                </div>
                <argon-checkbox checked>
                  <label class="form-check-label" for="flexCheckDefault">
                    Acepto los
                    <a href="javascript:;" class="text-dark font-weight-bolder">Términos y Condiciones</a>
                  </label>
                </argon-checkbox>
                <div class="text-center">
                  <argon-button
                    fullWidth
                    color="dark"
                    variant="gradient"
                    class="my-4 mb-2"
                    type="submit"
                  >
                    Registrarse
                  </argon-button>
                </div>
                <p class="text-sm mt-3 mb-0">
                  ¿Ya tienes una cuenta?
                  <a
                    @click.prevent="router.push('/signin')"
                    class="text-dark font-weight-bolder"
                    style="cursor: pointer;"
                  >
                    Iniciar sesión
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <app-footer />
</template>
