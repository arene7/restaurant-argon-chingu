<template>
  <div>
    <div>
      <div class="card mb-4">
        <div class="card-header pb-0 d-flex justify-content-between align-items-center">
          <h6>Lista de Reservas</h6>
        </div>
        <div class="card-body px-0 pt-0 pb-2">
          <div class="container">
            <div class="row justify-content-end">
              <!-- Filtros -->
              <div class="col-sm-2 mb-3">
                <argon-input
                  id="customerName"
                  type="text"
                  placeholder="Filtrar por Nombre"
                  v-model="filters.customerName"
                />
              </div>
              <div class="col-sm-2 mb-3">
                <argon-input
                  id="date"
                  type="date"
                  placeholder="Filtrar por Fecha"
                  v-model="filters.date"
                />
              </div>
              <div class="col-sm-2 mb-3">
                <select
                  id="status"
                  class="form-select form-control-sm"
                  v-model="filters.status"
                >
                  <option value="">Filtrar por Estado</option>
                  <option value="In progress">En progreso</option>
                  <option value="Closed">Cerrada</option>
                  <option value="Reserved">Reservada</option>
                </select>
              </div>
            </div>
          </div>
          <div class="table-responsive p-0">
            <table class="table align-items-center mb-0">
              <thead>
                <tr>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nombre del Cliente</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Mesa</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Fecha</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Hora</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Estado</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Personas</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredReservations.length === 0">
                  <td colspan="7" class="text-center">
                    <p class="text-sm font-weight-bold mb-0">No hay datos disponibles.</p>
                  </td>
                </tr>
                <tr v-for="reservation in filteredReservations" :key="reservation.id">
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
                    <p class="text-xs font-weight-bold mb-0">{{ reservation.table }}</p>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-secondary text-xs font-weight-bold">{{ reservation.date }}</span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-secondary text-xs font-weight-bold">{{ reservation.time }}</span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-secondary text-xs font-weight-bold">{{ reservation.status }}</span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-secondary text-xs font-weight-bold">{{ reservation.peopleCount }}</span>
                  </td>
                  <td class="align-middle text-center">
                    <button class="btn btn-link text-secondary mb-0" @click="editReservation(reservation)">
                      <i class="fa fa-edit text-xs" aria-hidden="true"></i> Editar
                    </button>
                    <button class="btn btn-link text-danger mb-0" @click="confirmDeleteReservation(reservation.id, reservation.email)">
                      <i class="fa fa-trash text-xs" aria-hidden="true"></i> Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal para Crear/Editar -->
      <div v-if="showAddReservationModal" class="modal d-block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editingReservation ? 'Editar Reserva' : 'Nueva Reserva' }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <!-- <argon-input v-model="form.customerName" placeholder="Nombre del Cliente" size="sm" /> -->
              <select v-model="form.table" class="form-select mt-3">
                <option value="" disabled>Seleccionar Mesa</option>
                <option v-for="table in availableTables" :key="table.id" :value="table.id">
                  Mesa {{ table.id }} (Capacidad: {{ table.capacity }})
                </option>
              </select> <br>
              <argon-input v-model="form.peopleCount" placeholder="Personas" size="sm" type="number" min="1" />
              <argon-input v-model="form.date" type="date" placeholder="Fecha" size="sm" />
              <select v-model="form.time" class="form-select mt-3" required>
                <option value="" disabled>Seleccionar Hora</option>
                <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
              </select>
              <select v-model="form.status" class="form-select mt-3">
                <option value="">Seleccionar Estado</option>
                <option value="Reserved">Reservada</option>
                <option value="Closed">Cerrada</option>
                <option value="Standby time">En espera</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
              <button
                type="button"
                class="btn btn-primary"
                @click="editingReservation ? updateReservation() : createReservation()"
              >
                {{ editingReservation ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import emailjs from "emailjs-com";
import ArgonInput from '@/components/ArgonInput.vue'; 

export default {
  components: {
    ArgonInput
  },
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
        time: '',
        status: '',
        peopleCount: 1,
        email: '' 
      },
      filters: {
        customerName: '',
        table: '',
        date: new Date().toISOString().split("T")[0], 
        status: ''
      },
      timeSlots: [
        "08:00 - 10:00",
        "10:00 - 12:00",
        "12:00 - 14:00",
        "14:00 - 16:00",
        "16:00 - 18:00",
        "18:00 - 20:00",
        "20:00 - 22:00"
      ],
      availableTables: [
        { id: 1, capacity: 4 },
        { id: 2, capacity: 2 },
        { id: 3, capacity: 6 },
        { id: 4, capacity: 4 },
        { id: 5, capacity: 8 },
        { id: 6, capacity: 4 },
        { id: 7, capacity: 2 },
        { id: 8, capacity: 4 },
        { id: 9, capacity: 6 },
        { id: 10, capacity: 8 }
      ]
    };
  },
  computed: {
    filteredReservations() {
      return this.reservations.filter(reservation => {
        return Object.keys(this.filters).every(key => {
          return this.checkNull(reservation[key]).toLowerCase().includes(this.filters[key].toLowerCase());
        });
      });
    }
  },
  methods: {
    checkNull(value) {
      return value ? value.toString() : '';
    },
    async fetchReservations() {
      const querySnapshot = await getDocs(collection(db, "reservations"));
      this.reservations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtramos mesas disponibles según la capacidad y la ocupación
      this.availableTables = this.availableTables.filter(table => {
        return !this.reservations.some(reservation => {
          return reservation.table === table.id &&
            reservation.date === this.form.date &&
            reservation.time === this.form.time;
        });
      });
    },
    async createReservation() {
      try {
        const selectedTable = this.availableTables.find(table => table.id === this.form.table);
        if (!selectedTable) {
          alert("Mesa no disponible.");
          return;
        }

        if (this.form.peopleCount > selectedTable.capacity) {
          alert(`La mesa seleccionada solo tiene capacidad para ${selectedTable.capacity} personas.`);
          return;
        }

        const docRef = await addDoc(collection(db, "reservations"), this.form);
        console.log("Reserva creada con ID: ", docRef.id);
        this.fetchReservations();
        this.resetForm();
        this.showAddReservationModal = false;

        if (this.form.status === 'Reserved' || this.form.status === 'Closed') {
          this.sendEmailNotification(this.form.customerName, this.form.status, this.form.email);
        }
      } catch (error) {
        console.error("Error creando reserva: ", error);
      }
    },
    async updateReservation() {
      try {
        const selectedTable = this.availableTables.find(table => table.id === this.form.table);
        if (!selectedTable) {
          alert("Mesa no disponible.");
          return;
        }

        if (this.form.peopleCount > selectedTable.capacity) {
          alert(`La mesa seleccionada solo tiene capacidad para ${selectedTable.capacity} personas.`);
          return;
        }

        const reservationRef = doc(db, "reservations", this.editingReservation.id);
        await updateDoc(reservationRef, this.form);
        await this.fetchReservations();
        this.showAddReservationModal = false;
        this.editingReservation = null;

        if (this.form.status === 'Reserved' || this.form.status === 'Closed') {
          this.sendEmailNotification(this.form.customerName, this.form.status, this.form.email);
        }
      } catch (error) {
        console.error("Error actualizando reserva: ", error);
      }
    },
    resetForm() {
      this.form.customerName = '';
      this.form.table = '';
      this.form.date = '';
      this.form.time = '';
      this.form.status = '';
      this.form.peopleCount = 1;
      this.form.email = '';
    },
    closeModal() {
      this.showAddReservationModal = false;
      this.resetForm();
    },
    editReservation(reservation) {
      this.editingReservation = reservation;
      this.form = { ...reservation }; 
      this.showAddReservationModal = true;
    },
    async confirmDeleteReservation(id, email) {
      const confirmed = confirm("¿Estás seguro de que deseas eliminar esta reserva?");
      if (confirmed) {
        await this.deleteReservation(id, email);
      }
    },
    async deleteReservation(id, email) {
      try {
        await deleteDoc(doc(db, "reservations", id));
        this.fetchReservations();
        this.sendEmailNotification('Reserva eliminada', 'Cerrada', email);
      } catch (error) {
        console.error("Error eliminando reserva: ", error);
      }
    },
    sendEmailNotification(customerName, status, email) {
      const templateParams = {
        customerName: customerName,
        status: status,
        email: email
      };
      
      emailjs.send('your_service_id', 'your_template_id', templateParams, 'your_user_id')
        .then(response => {
          console.log('Correo enviado con éxito', response);
        })
        .catch(error => {
          console.error('Error enviando el correo', error);
        });
    }
  },
  mounted() {
    this.fetchReservations();
  }
};
</script>

<style scoped>
/* Agregar aquí tu estilo CSS */
</style>
