<template>
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
                size="sm"
              />
            </div>
            <div class="col-sm-2 mb-3">
              <argon-input
                id="table"
                type="text"
                placeholder="Filtrar por Mesa"
                v-model="filters.table"
                size="sm"
              />
            </div>
            <div class="col-sm-2 mb-3">
              <argon-input
                id="date"
                type="date"
                placeholder="Filtrar por Fecha"
                v-model="filters.date"
                size="sm"
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
              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Verificar si hay datos -->
            <tr v-if="filteredReservations.length === 0">
              <td colspan="6" class="text-center">
                <p class="text-sm font-weight-bold mb-0">No hay datos disponibles.</p>
              </td>
            </tr>
            <!-- Mostrar reservaciones si existen -->
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
                <p class="text-sm font-weight-bold mb-0">{{ reservation.table }}</p>
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
              <td class="align-middle text-center">
                <button class="btn btn-link text-secondary mb-0" @click="editReservation(reservation)">
                  <i class="fa fa-edit text-xs" aria-hidden="true"></i> Editar
                </button>
                <button class="btn btn-link text-danger mb-0" @click="confirmDeleteReservation(reservation.id)">
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
            <argon-input v-model="form.customerName" placeholder="Nombre del Cliente" size="sm" />
            <argon-input v-model="form.table" placeholder="Mesa (asignada automáticamente)" size="sm" disabled />
            <argon-input v-model="form.date" type="date" placeholder="Fecha" size="sm" />
            <argon-input v-model="form.time" type="time" placeholder="Hora" size="sm" />
            <select v-model="form.status" class="form-select mt-3">
              <option value="">Seleccionar Estado</option>
              <option value="In progress">En progreso</option>
              <option value="Closed">Cerrada</option>
              <option value="Reserved">Reservada</option>
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
</template>

<script>
import { db } from "@/firebase"; // Importa la configuración de Firebase
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import ArgonInput from "@/components/ArgonInput.vue";

export default {
  components: {
    ArgonInput,
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
        status: ''
      },
      filters: {
        customerName: '',
        table: '',
        date: new Date().toISOString().split("T")[0], // Por defecto: fecha actual
        status: ''
      }
    };
  },
  computed: {
    filteredReservations() {
      return this.reservations.filter(reservation => {
        // Mostrar las reservaciones de hoy si no se aplica otro filtro
        if (this.filters.date === new Date().toISOString().split("T")[0]) {
          return reservation.date === this.filters.date;
        }

        // Filtrar según los criterios seleccionados
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
      })).filter(reservation => {
        // Mostrar solo las reservaciones de hoy o las fechas futuras
        const today = new Date().toISOString().split("T")[0];
        return reservation.date >= today;
      });
    },
    async createReservation() {
      try {
        const availableTable = await this.checkAvailability(this.form.date, this.form.time);

        if (!availableTable) {
          alert("No hay mesas disponibles en el intervalo de tiempo seleccionado.");
          return;
        }

        this.form.table = availableTable;

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
      this.form = { ...reservation };
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
      if (confirm("¿Seguro que deseas eliminar esta reservación?")) {
        await this.deleteReservation(id);
      }
    },
    async deleteReservation(id) {
      try {
        await deleteDoc(doc(db, "reservations", id));
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
        time: '',
        status: ''
      };
    },
    closeModal() {
      this.showAddReservationModal = false;
      this.resetForm();
      this.editingReservation = null;
    },
  },
  mounted() {
    this.fetchReservations();
  }
};
</script>

