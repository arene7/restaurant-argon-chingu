<template>
  <div class="d-flex justify-content-center">
    <div v-for="table in tables" :key="table.id" class="table-container">
      <svg 
        width="50" 
        height="50" 
        :fill="table.occupied ? 'purple' : 'gray'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24">
        <polygon points="12,2 2,12 12,22 22,12" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/firebase"; 
import { collection, getDocs } from "firebase/firestore";

const tables = ref(Array.from({ length: 10 }, (_, i) => ({ id: i + 1, occupied: false })));

const fetchReservations = async () => {
  try {
    const snapshot = await getDocs(collection(db, "reservations"));
    const reservations = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    
    // Actualiza el estado de las mesas según las reservas
    reservations.forEach(reservation => {
      const table = tables.value.find(table => table.id === reservation.table);
      if (table) {
        table.occupied = true; // Marca la mesa como ocupada
      }
    });
  } catch (error) {
    console.error("Error al obtener las reservaciones:", error);
  }
};

onMounted(() => {
  fetchReservations();
});
</script>

<style scoped>
.table-container {
  margin: 0 5px;
}
</style>
