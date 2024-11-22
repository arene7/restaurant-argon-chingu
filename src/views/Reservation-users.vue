<template>
  <main class="mt-0 main-content">
    <section>
      <div class="page-header min-vh-100">
        <div class="container">
          <div class="row">
            <div class="mx-auto col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-lg-0">
              <div class="card card-plain">
                <div class="pb-0 card-header text-start">
                  <h4 class="font-weight-bolder">Crear Reserva</h4>
                  <p class="mb-0">Rellena los detalles para crear tu reserva</p>
                </div>
                <div class="card-body">
                  <form @submit.prevent="createReservation" role="form">
                    <!-- Nombre del Cliente -->
                    <div class="mb-3">
                      <argon-input
                        id="customerName"
                        type="text"
                        placeholder="Nombre del Cliente"
                        v-model="reservation.customerName"
                        size="lg"
                        required
                      />
                    </div>
                    <!-- Correo Electrónico -->
                    <div class="mb-3">
                      <argon-input
                        id="email"
                        type="email"
                        placeholder="Correo Electrónico"
                        v-model="reservation.email"
                        size="lg"
                        required
                      />
                    </div>
                    <!-- Fecha de la Reserva -->
                    <div class="mb-3">
                      <argon-input
                        id="date"
                        type="date"
                        placeholder="Fecha de Reserva"
                        v-model="reservation.date"
                        :min="currentDate"
                        size="lg"
                        required
                      />
                    </div>
                    <!-- Horarios -->
                    <div class="mb-3">
                      <select
                        id="time"
                        class="form-select form-control-lg"
                        v-model="reservation.time"
                        required
                      >
                        <option disabled value="">Selecciona un Horario</option>
                        <option
                          v-for="slot in timeSlots"
                          :key="slot"
                          :value="slot"
                        >
                          {{ slot }}
                        </option>
                      </select>
                    </div>
                    <!-- Botón Enviar -->
                    <div class="text-center">
                      <argon-button
                        class="mt-4"
                        variant="gradient"
                        color="success"
                        fullWidth
                        size="lg"
                        @click="createReservation"
                      >
                        Crear Reserva
                      </argon-button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div
              class="top-0 my-auto text-center col-6 d-lg-flex d-none h-100 pe-0 position-absolute end-0 justify-content-center flex-column"
            >
              <div
                class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center overflow-hidden"
                style="background-image: url(&quot;https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signin-ill.jpg&quot;);
                  background-size: cover;"
              >
                <span class="mask bg-gradient-success opacity-6"></span>
                <h4 class="mt-5 text-white font-weight-bolder position-relative">
                  "¡Haz tu reserva ahora!"
                </h4>
                <p class="text-white position-relative">
                  Elige la fecha y la hora que te convengan.
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
import { onBeforeUnmount, onBeforeMount, reactive, computed } from "vue";
import { useStore } from "vuex";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase"; // Import Firebase configuration
import emailjs from "emailjs-com"; // Import EmailJS SDK
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";

// Vuex and routing
const body = document.getElementsByTagName("body")[0];
const store = useStore();

// Reactive reservation model
const reservation = reactive({
  customerName: "",
  email: "",
  date: "",
  time: "",
});

// Get today's date to disable past dates
const currentDate = computed(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

// Time slots for reservations (2-hour intervals)
const timeSlots = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00",
];

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

const createReservation = async () => {
  try {
    // Guardar la reserva en Firestore
    await addDoc(collection(db, "reservations"), {
      customerName: reservation.customerName,
      email: reservation.email,
      date: reservation.date,
      time: reservation.time,
      table: null, // Asignar una mesa más adelante si es necesario
      status: "In progress", // Estado predeterminado
    });

    // Enviar el correo de confirmación utilizando EmailJS
    const emailParams = {
      to_email: reservation.email, // Aquí se pasa el correo del cliente
      customer_name: reservation.customerName,
      reservation_date: reservation.date,
      reservation_time: reservation.time,
    };

    emailjs.send("service_y28smfi", "template_bz23rbb", emailParams, "IgPMcQIU8WEdVUbJy")
      .then((response) => {
        console.log("Correo de confirmación enviado", response);
      })
      .catch((error) => {
        console.error("Error al enviar el correo", error);
      });

    alert("Reserva creada con éxito!");

  } catch (error) {
    console.error("Error al crear la reserva:", error);
    alert("Error al crear la reserva. Por favor, intenta de nuevo.");
  }
};
</script>

<style scoped>
/* Puedes añadir estilos personalizados aquí si es necesario */
</style>
