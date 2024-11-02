<template>
  <div class="py-4 container-fluid">
    <h6 class="mb-2">Add a Reservation</h6>
    <form @submit.prevent="addReservation">
      <div class="mb-3">
        <label for="customerName" class="form-label">Customer Name</label>
        <input
          v-model="newReservation.customerName"
          type="text"
          class="form-control"
          id="customerName"
          required
        />
      </div>
      <div class="mb-3">
        <label for="date" class="form-label">Date</label>
        <input
          v-model="newReservation.date"
          type="date"
          class="form-control"
          id="date"
          :min="minDate"
          required
        />
      </div>
      <div class="mb-3">
        <label for="time" class="form-label">Time</label>
        <select
          v-model="newReservation.time"
          class="form-control"
          id="time"
          required
        >
          <option disabled value="">Select a time slot</option>
          <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">Add Reservation</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { db } from "@/firebase"; // Ajusta la ruta si es necesario
import { collection, addDoc, getDocs } from "firebase/firestore";

// Datos del nuevo registro
const newReservation = ref({
  customerName: "",
  date: "",
  time: "",
  table: "", // Campo para el número de mesa
});

// Variables auxiliares
const minDate = new Date().toISOString().split("T")[0]; // Fecha mínima hoy
const timeSlots = ref(["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00"]); // Definir horarios
const tables = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, occupied: false })); // Generar mesas

// Función para agregar una reserva con validación de disponibilidad
const addReservation = async () => {
  if (newReservation.value.customerName && newReservation.value.date && newReservation.value.time) {
    try {
      // Consultar reservas existentes en la base de datos
      const reservationsCollection = collection(db, "reservations");
      const querySnapshot = await getDocs(reservationsCollection);
      const existingReservations = querySnapshot.docs.map(doc => doc.data());

      // Verificar disponibilidad de mesa para la fecha y hora
      const isTableOccupied = existingReservations.some(
        reservation =>
          reservation.table === newReservation.value.table &&
          reservation.date === newReservation.value.date &&
          reservation.time === newReservation.value.time
      );

      if (isTableOccupied) {
        alert(`The table ${newReservation.value.table} is already reserved at this date and time.`);
        return;
      }

      // Asignar una mesa disponible si no se especificó
      const availableTable = tables.find(table => 
        !table.occupied && !existingReservations.some(r => r.table === table.id)
      );

      if (!availableTable) {
        alert("No tables available.");
        return;
      }

      // Datos de la reserva
      const reservationData = {
        customerName: newReservation.value.customerName,
        date: newReservation.value.date,
        time: newReservation.value.time,
        table: availableTable.id
      };

      // Agregar reserva a Firebase
      await addDoc(collection(db, "reservations"), reservationData);
      alert(`Reservation added: ${newReservation.value.customerName} on ${newReservation.value.date} at ${newReservation.value.time}`);

      // Marcar mesa como ocupada localmente y limpiar formulario
      availableTable.occupied = true;
      newReservation.value.customerName = "";
      newReservation.value.date = "";
      newReservation.value.time = "";
    } catch (error) {
      console.error("Error adding reservation:", error);
      alert("Failed to add reservation. Please try again.");
    }
  } else {
    alert("Please fill in all fields.");
  }
};
</script>

<style scoped>
/* Estilos personalizados */
</style>
