<template>
  <div>
    <div class="card mb-4">
      <div class="card-header pb-0 d-flex justify-content-between align-items-center">
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
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reservation in reservations" :key="reservation.id">
                <td>
                  <div class="d-flex px-2">
                    <div>
                      <img :src="reservationImage" class="avatar avatar-sm rounded-circle me-2" alt="Avatar" />
                    </div>
                    <div class="my-auto">
                      <h6 class="mb-0 text-sm">{{ reservation.customerName }}</h6>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="text-sm font-weight-bold mb-0">{{ reservation.table }}</p>
                </td>
                <td class="align-middle text-center text-sm">
                  <span class="text-secondary text-xs font-weight-bold">{{ reservation.date }}</span>
                </td>
                <td class="align-middle text-center text-sm">
                  <span class="text-secondary text-xs font-weight-bold">{{ reservation.time }}</span>
                </td>
                <td class="align-middle text-center">
                  <button class="btn btn-link text-secondary mb-0" @click="editReservation(reservation)">
                    <i class="fa fa-edit text-xs" aria-hidden="true"></i> Edit
                  </button>
                  <button class="btn btn-link text-danger mb-0" @click="confirmDeleteReservation(reservation.id)">
                    <i class="fa fa-trash text-xs" aria-hidden="true"></i> Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

</template>

<script>

import { db } from "@/firebase"; // Importa la configuración de Firebase
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default {
  data() {
    return {
      reservations: [],
      showAddReservationModal: false,
      editingReservation: null,
      reservationImage: "https://cdn-icons-png.flaticon.com/512/10935/10935738.png",
      form: {
        customerName: '',
        table: '',
        date: '',
        time: ''
      },
    };
  },
  methods: {
    async fetchReservations() {
      const querySnapshot = await getDocs(collection(db, "reservations"));
      this.reservations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    async createReservation() {
      try {
        await addDoc(collection(db, "reservations"), this.form);
        await this.fetchReservations();
        this.resetForm();
        this.showAddReservationModal = false;
      } catch (error) {
        console.error("Error creating reservation: ", error);
      }
    },
    editReservation(reservation) {
      this.editingReservation = reservation;
      this.form = { ...reservation }; // Populate the form with reservation data
      this.showAddReservationModal = true;
    },
    async updateReservation() {
      try {
        const reservationRef = doc(db, "reservations", this.editingReservation.id);
        await updateDoc(reservationRef, this.form);
        await this.fetchReservations();
        this.resetForm();
        this.showAddReservationModal = false;
        this.editingReservation = null;
      } catch (error) {
        console.error("Error updating reservation: ", error);
      }
    },
    async confirmDeleteReservation(id) {
      if (confirm("Are you sure you want to delete this reservation?")) {
        await this.deleteReservation(id);
      }
    },
    async deleteReservation(id) {
      try {
        const reservationRef = doc(db, "reservations", id);
        await deleteDoc(reservationRef);
        await this.fetchReservations();
      } catch (error) {
        console.error("Error deleting reservation: ", error);
      }
    },
    resetForm() {
      this.form = {
        customerName: '',
        table: '',
        date: '',
        time: ''
      };
    },
    closeModal() {
      this.showAddReservationModal = false;
      this.resetForm();
      this.editingReservation = null;
    }
  },
  mounted() {
    this.fetchReservations();
  },
};
</script>

<style scoped>
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
</style>
