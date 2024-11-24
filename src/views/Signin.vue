<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <div class="col-12">
        <navbar
          isBlur="blur border-radius-lg my-3 py-2 start-0 end-0 mx-4 shadow"
          v-bind:darkMode="true"
          isBtn="bg-gradient-success"
        />
      </div>
    </div>
  </div>
  <main class="mt-0 main-content">
    <section>
      <div class="page-header min-vh-100">
        <div class="container">
          <div class="row">
            <div class="mx-auto col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-lg-0">
              <div class="card card-plain">
                <div class="pb-0 card-header text-start">
                  <h4 class="font-weight-bolder">Iniciar sesión</h4>
                  <p class="mb-0">Ingresa tu correo electrónico y contraseña para iniciar sesión</p>
                </div>
                <div class="card-body">
                  <form @submit.prevent="onSubmit" role="form">
                    <div class="mb-3">
                      <argon-input
                        id="email"
                        type="email"
                        placeholder="Correo electrónico"
                        v-model="model.email"
                        size="lg"
                      />
                    </div>
                    <div class="mb-3">
                      <argon-input
                        id="password"
                        type="password"
                        placeholder="Contraseña"
                        v-model="model.password"
                        size="lg"
                      />
                    </div>
                    <argon-switch id="rememberMe" name="remember-me">
                      Recuérdame
                    </argon-switch>
                    <div class="text-center">
                      <argon-button
                        class="mt-4"
                        variant="gradient"
                        color="success"
                        fullWidth
                        size="lg"
                      >
                        Iniciar sesión
                      </argon-button>
                    </div>
                  </form>
                </div>
                <div class="px-1 pt-0 text-center card-footer px-lg-2">
                  <p class="mx-auto mb-4 text-sm">
                    ¿No tienes una cuenta?
                    <a
                      href="javascript:;"
                      @click="goToSignup"
                      class="text-success text-gradient font-weight-bold"
                    >
                      Regístrate
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <div
              class="top-0 my-auto text-center col-6 d-lg-flex d-none h-100 pe-0 position-absolute end-0 justify-content-center flex-column"
            >
              <div
                class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center overflow-hidden"
                style="
                  background-image: url(&quot;https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signin-ill.jpg&quot;);
                  background-size: cover;
                "
              >
                <span class="mask bg-gradient-success opacity-6"></span>
                <h4 class="mt-5 text-white font-weight-bolder position-relative">
                  "La atención es la nueva moneda"
                </h4>
                <p class="text-white position-relative">
                  Cuanto más sencillo parece escribir, más esfuerzo ha puesto el escritor en el proceso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onBeforeMount, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";  // importar useRouter
import Navbar from "@/examples/PageLayout/Navbar.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/firebase";  // asegurarse de que la configuración de Firebase esté correctamente importada

const body = document.getElementsByTagName("body")[0];
const store = useStore();
const router = useRouter();  // inicializar el router

const model = reactive({
  email: '',
  password: ''
});

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

const onSubmit = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, model.email, model.password);
    const user = userCredential.user;
    console.log('Usuario iniciado sesión:', user);
    router.push('/dashboard-default');  // usar el router para navegar
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    alert('Error de inicio de sesión: ' + error.message);
  }
};

// Navegar a la página de registro
const goToSignup = () => {
  router.push('/signup');  // Navegar a /signup
};

// eslint-disable-next-line no-unused-vars
const loginWithProvider = async (providerName) => {
  let provider;
  if (providerName === 'google') {
    provider = new GoogleAuthProvider();
  }
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('Usuario iniciado sesión con el proveedor:', user);
    router.push('/dashboard');  // usar el router para navegar
  } catch (error) {
    console.error('Error con el inicio de sesión con el proveedor:', error.message);
    alert('Error al iniciar sesión con el proveedor: ' + error.message);
  }
};
</script>

<style scoped>
/* Puedes añadir estilos personalizados aquí si es necesario */
</style>
