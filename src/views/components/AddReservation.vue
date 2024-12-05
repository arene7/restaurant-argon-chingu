<template>
  <div class="py-4 container-fluid">
    <h6 class="mb-2">Añadir Reserva</h6>
    <form @submit.prevent="addReservation">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="customerName" class="form-label">Nombre del Cliente</label>
          <input
            v-model="newReservation.customerName"
            type="text"
            class="form-control"
            id="customerName"
            required
          />
        </div>
        <div class="col-md-6 mb-3">
          <label for="email" class="form-label">Correo Electrónico</label>
          <input
            v-model="newReservation.email"
            type="email"
            class="form-control"
            id="email"
            required
          />
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="date" class="form-label">Fecha</label>
          <input
            v-model="newReservation.date"
            type="date"
            class="form-control"
            id="date"
            :min="minDate"
            required
          />
        </div>
        <div class="col-md-6 mb-3">
          <label for="time" class="form-label">Hora</label>
          <select
            v-model="newReservation.time"
            class="form-control"
            id="time"
            required
          >
            <option disabled value="">Selecciona un horario</option>
            <option
              v-for="slot in timeSlots"
              :key="slot"
              :value="slot"
            >{{ slot }}</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="table" class="form-label">Mesa</label>
          <select
            v-model="newReservation.table"
            class="form-control"
            id="table"
            required
          >
            <option disabled value="">Selecciona una mesa</option>
            <option
              v-for="table in availableTables"
              :key="table.id"
              :value="table.id"
            >{{ `Mesa ${table.id} (Capacidad: ${table.capacity})` }}</option>
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <label for="peopleCount" class="form-label">Cantidad de Personas</label>
          <input
            v-model="newReservation.peopleCount"
            type="number"
            class="form-control"
            id="peopleCount"
            min="1"
            required
          />
        </div>
      </div>

      <div class="mb-3">
        <label for="status" class="form-label">Estado</label>
        <select
          v-model="newReservation.status"
          class="form-control"
          id="status"
          required
        >
          <option disabled value="">Selecciona un estado</option>
          <option value="In progress">En progreso</option>
          <option value="Reserved">Reservada</option>
          <option value="Standby time">En espera</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">Añadir Reserva</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const newReservation = ref({
  customerName: "",
  email: "",
  date: "",
  time: "",
  table: "",
  peopleCount: "", // Cantidad de personas
  status: "",
});

const minDate = new Date().toISOString().split("T")[0];
const timeSlots = ref([
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00",
]);

const availableTables = ref([]);

const fetchAvailableTables = async () => {
  try {
    const reservationsCollection = collection(db, "reservations");
    const querySnapshot = await getDocs(reservationsCollection);
    const existingReservations = querySnapshot.docs.map((doc) => doc.data());

    // Definir mesas con capacidad
    const allTables = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      capacity: Math.floor(Math.random() * (8 - 2 + 1)) + 2, // Capacidad entre 2 y 8 sillas
      occupied: false,
    }));

    allTables.forEach((table) => {
      table.occupied = existingReservations.some(
        (reservation) =>
          reservation.table === table.id &&
          reservation.date === newReservation.value.date &&
          reservation.time === newReservation.value.time
      );
    });

    availableTables.value = allTables.filter((table) => !table.occupied);
  } catch (error) {
    console.error("Error al obtener mesas disponibles:", error);
  }
};

onMounted(fetchAvailableTables);

const addReservation = async () => {
  if (
    newReservation.value.customerName &&
    newReservation.value.email &&
    newReservation.value.date &&
    newReservation.value.time &&
    newReservation.value.table &&
    newReservation.value.peopleCount &&
    newReservation.value.status
  ) {
    try {
      const selectedTable = availableTables.value.find(
        (table) => table.id === newReservation.value.table
      );

      if (selectedTable && newReservation.value.peopleCount > selectedTable.capacity) {
        alert(
          `La mesa ${selectedTable.id} solo tiene capacidad para ${selectedTable.capacity} personas. Por favor, selecciona otra mesa o ajusta la cantidad de personas.`
        );
        return;
      }

      const reservationsCollection = collection(db, "reservations");
      const querySnapshot = await getDocs(reservationsCollection);
      const existingReservations = querySnapshot.docs.map((doc) => doc.data());

      const isTableOccupied = existingReservations.some(
        (reservation) =>
          reservation.table === newReservation.value.table &&
          reservation.date === newReservation.value.date &&
          reservation.time === newReservation.value.time
      );

      if (isTableOccupied) {
        alert(`La mesa ${newReservation.value.table} ya está reservada para esta fecha y horario.`);
        return;
      }

      const reservationData = {
        customerName: newReservation.value.customerName,
        email: newReservation.value.email,
        date: newReservation.value.date,
        time: newReservation.value.time,
        table: newReservation.value.table,
        peopleCount: newReservation.value.peopleCount,
        status: newReservation.value.status,
      };

      await addDoc(collection(db, "reservations"), reservationData);

      alert(`Reserva añadida correctamente.`);

      newReservation.value.customerName = "";
      newReservation.value.email = "";
      newReservation.value.date = "";
      newReservation.value.time = "";
      newReservation.value.table = "";
      newReservation.value.peopleCount = "";
      newReservation.value.status = "";

      fetchAvailableTables();
    } catch (error) {
      console.error("Error al añadir la reserva:", error);
      alert("No se pudo añadir la reserva. Por favor, inténtalo de nuevo.");
    }
  } else {
    alert("Por favor, completa todos los campos.");
  }
};
</script>

<style scoped>
/* Estilos personalizados */
</style>
