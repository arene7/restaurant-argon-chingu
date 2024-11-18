<template>
    <!-- <div class="container top-0 position-sticky z-index-sticky">
      <div class="row">
        <div class="col-12">
          <navbar
            isBlur="blur border-radius-lg my-3 py-2 start-0 end-0 mx-4 shadow"
            v-bind:darkMode="true"
            isBtn="bg-gradient-success"
          />
        </div>
      </div>
    </div> -->
    <main class="mt-0 main-content">
      <section>
        <div class="page-header min-vh-100">
          <div class="container">
            <div class="row">
              <div class="mx-auto col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-lg-0">
                <div class="card card-plain">
                  <div class="pb-0 card-header text-start">
                    <h4 class="font-weight-bolder">Create Reservation</h4>
                    <p class="mb-0">Fill in the details to create your reservation</p>
                  </div>
                  <div class="card-body">
                    <form @submit.prevent="createReservation" role="form">
                      <!-- Customer Name -->
                      <div class="mb-3">
                        <argon-input
                          id="customerName"
                          type="text"
                          placeholder="Customer Name"
                          v-model="reservation.customerName"
                          size="lg"
                          required
                        />
                      </div>
                      <!-- Reservation Date -->
                      <div class="mb-3">
                        <argon-input
                          id="date"
                          type="date"
                          placeholder="Reservation Date"
                          v-model="reservation.date"
                          :min="currentDate"
                          size="lg"
                          required
                        />
                      </div>
                      <!-- Time Slots -->
                      <div class="mb-3">
                        <select
                          id="time"
                          class="form-select form-control-lg"
                          v-model="reservation.time"
                          required
                        >
                          <option disabled value="">Select Time</option>
                          <option
                            v-for="slot in timeSlots"
                            :key="slot"
                            :value="slot"
                          >
                            {{ slot }}
                          </option>
                        </select>
                      </div>
                      <!-- Submit Button -->
                      <div class="text-center">
                        <argon-button
                          class="mt-4"
                          variant="gradient"
                          color="success"
                          fullWidth
                          size="lg"
                          @click="createReservation"
                        >
                          Create Reservation
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
                    "Make your reservation now!"
                  </h4>
                  <p class="text-white position-relative">
                    Choose the date and time that works for you.
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
  import { useRouter } from "vue-router";
  import { addDoc, collection } from "firebase/firestore";
  import { db } from "@/firebase"; // Import Firebase configuration
  // import Navbar from "@/examples/PageLayout/Navbar.vue";
  import ArgonInput from "@/components/ArgonInput.vue";
  import ArgonButton from "@/components/ArgonButton.vue";
  
  // Vuex and routing
  const body = document.getElementsByTagName("body")[0];
  const store = useStore();
  const router = useRouter();
  
  // Reactive reservation model
  const reservation = reactive({
    customerName: "",
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
  
  // Create reservation function
  const createReservation = async () => {
    try {
      // Add to Firestore collection "reservations"
      await addDoc(collection(db, "reservations"), {
        customerName: reservation.customerName,
        date: reservation.date,
        time: reservation.time,
        table: null, // Assign a table later if needed
        status: "In progress", // Default status
      });
  
      alert("Reservation created successfully!");
      // Redirect to another page if needed
      router.push("/dashboard-default");
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Failed to create reservation. Please try again.");
    }
  };
  </script>
  
  