<template>
  <div class="card">
    <div class="card-header pb-0">
      <h6>List of Reservations</h6>
    </div>
    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <table class="table align-items-center mb-0">
          <thead>
            <tr>
              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Customer Name</th>
              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Table</th>
              <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Date</th>
              <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Time</th>
              <th class="text-secondary opacity-7"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(reservation, index) in reservations" :key="reservation.id">
              <td>
                <div class="d-flex px-2 py-1">
                  <img :src="reservationImage" class="avatar avatar-sm me-3" alt="Avatar">
                  <div class="d-flex flex-column justify-content-center">
                    <input v-if="editIndex === index" v-model="editReservationData.customerName" class="form-control form-control-sm" />
                    <h6 v-else class="mb-0 text-sm">{{ reservation.customerName }}</h6>
                  </div>
                </div>
              </td>
              <td>
                <input v-if="editIndex === index" v-model="editReservationData.table" class="form-control form-control-sm" />
                <p v-else class="text-xs font-weight-bold mb-0">{{ reservation.table }}</p>
              </td>
              <td class="align-middle text-center text-sm">
                <input v-if="editIndex === index" v-model="editReservationData.date" class="form-control form-control-sm" />
                <span v-else class="text-secondary text-xs font-weight-bold">{{ reservation.date }}</span>
              </td>
              <td class="align-middle text-center text-sm">
                <input v-if="editIndex === index" v-model="editReservationData.time" class="form-control form-control-sm" />
                <span v-else class="text-secondary text-xs font-weight-bold">{{ reservation.time }}</span>
              </td>
              <td class="align-middle">
                <a v-if="editIndex !== index" href="javascript:void(0);" class="text-secondary font-weight-bold text-xs me-2" @click="startEditReservation(index)">Edit</a>
                <a v-else href="javascript:void(0);" class="text-secondary font-weight-bold text-xs me-2" @click="saveReservation(index)">Save</a>
                <a href="javascript:void(0);" class="text-secondary font-weight-bold text-xs" @click="confirmDeleteReservation(reservation.id)">Delete</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/firebase"; // Ajusta la ruta si es necesario
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const reservations = ref([]);
const editIndex = ref(null);
const editReservationData = ref({}); // Datos editados temporalmente
const reservationImage = "https://cdn-icons-png.flaticon.com/512/10935/10935738.png"; // URL de la imagen

// Obtener las reservas desde Firebase
const fetchReservations = async () => {
  try {
    const reservationsCollection = collection(db, "reservations");
    const querySnapshot = await getDocs(reservationsCollection);
    reservations.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching reservations: ", error);
  }
};

// Iniciar la edición de una reserva
const startEditReservation = (index) => {
  editIndex.value = index;
  editReservationData.value = { ...reservations.value[index] }; // Clonar datos de reserva actual
};

// Guardar cambios de la reserva
const saveReservation = async (index) => {
  const reservation = editReservationData.value;
  try {
    const reservationDoc = doc(db, "reservations", reservation.id);
    await updateDoc(reservationDoc, {
      customerName: reservation.customerName,
      table: reservation.table,
      date: reservation.date,
      time: reservation.time
    });
    reservations.value[index] = { ...reservation }; // Actualizar solo el elemento modificado
    editIndex.value = null; // Salir del modo de edición
  } catch (error) {
    console.error("Error updating reservation: ", error);
  }
};

// Confirmar y eliminar una reserva
const confirmDeleteReservation = async (id) => {
  if (confirm("Are you sure you want to delete this reservation?")) {
    await deleteReservation(id);
  }
};

// Eliminar una reserva de Firebase y actualizar la lista
const deleteReservation = async (id) => {
  try {
    const reservationDoc = doc(db, "reservations", id);
    await deleteDoc(reservationDoc);
    reservations.value = reservations.value.filter(reservation => reservation.id !== id); // Eliminar localmente
  } catch (error) {
    console.error("Error deleting reservation: ", error);
  }
};

// Cargar reservas al montar el componente
onMounted(() => {
  fetchReservations();
});
</script>

<style scoped>
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
</style>
