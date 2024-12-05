<template>
  <div class="container">
    <h6 class="text-center mb-3">
      Disponibilidad de mesas y sillas para el día presente en el intervalo de horas actual
    </h6>
    <div class="row justify-content-center">
      <div v-for="table in filteredTables" :key="table.id" class="col-auto table-container">
        <svg
          width="60"
          height="60"
          :fill="table.occupied ? 'orange' : 'gray'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="diamond-icon"
        >
          <polygon points="12,2 2,12 12,22 22,12" />
        </svg>
        <div
          class="capacity-circle"
          :style="{
            top: '5px',
            left: '5px',
            position: 'absolute',
            width: '20px',
            height: '20px',
            backgroundColor: 'darkgray',
            borderRadius: '50%',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
          }"
        >
          {{ table.capacity }}
        </div>
        <p class="text-center mt-1">{{ `Mesa ${table.id}` }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

const tables = ref(
  Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    occupied: false,
    capacity: Math.floor(Math.random() * 6) + 2, // Capacidad entre 2 y 6 sillas
  }))
);

const currentInterval = ref("");

// Intervals definidos
const timeIntervals = [
  { start: "08:00", end: "10:00" },
  { start: "10:00", end: "12:00" },
  { start: "12:00", end: "14:00" },
  { start: "14:00", end: "16:00" },
  { start: "16:00", end: "18:00" },
  { start: "18:00", end: "20:00" },
  { start: "20:00", end: "22:00" },
];

const getCurrentInterval = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinutes
    .toString()
    .padStart(2, "0")}`;

  return timeIntervals.find(
    (interval) =>
      currentTime >= interval.start && currentTime < interval.end
  ) || null;
};

const fetchReservations = async () => {
  try {
    const snapshot = await getDocs(collection(db, "reservations"));
    const reservations = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    const interval = getCurrentInterval();
    if (!interval) {
      console.warn("No hay intervalos activos en este momento.");
      currentInterval.value = null;
      return;
    }
    currentInterval.value = `${interval.start} - ${interval.end}`;

    // Filtra reservas del día y del intervalo activo
    const today = new Date().toISOString().split("T")[0];
    const activeReservations = reservations.filter(
      (reservation) =>
        reservation.date === today &&
        reservation.time === `${interval.start} - ${interval.end}`
    );

    // Actualiza estado de mesas
    tables.value.forEach((table) => {
      table.occupied = activeReservations.some(
        (reservation) => reservation.table === table.id
      );
    });
  } catch (error) {
    console.error("Error al obtener las reservaciones:", error);
  }
};

// Filtra las mesas basadas en su ocupación
const filteredTables = computed(() => tables.value);

onMounted(() => {
  fetchReservations();
});
</script>

<style scoped>
.table-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.diamond-icon {
  margin-bottom: 10px;
}
</style>
