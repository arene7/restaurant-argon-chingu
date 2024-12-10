<template>
  <main>
    <div class="container-fluid">
      <!-- Filtro de usuarios -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Usuarios del Restaurante</h6>
          <input v-model="filterEmail" @input="filterUsers" type="text" class="form-control w-25" placeholder="Filtrar por correo" />
        </div>
        <div class="card-body px-0 pt-0 pb-2">
          <div class="table-responsive p-0">
            <table class="table align-items-center justify-content-center mb-0">
              <thead>
                <tr>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                    Correo Electrónico
                  </th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                    Fecha Creada
                  </th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                    Estado
                  </th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                    Rol
                  </th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>
                    <div class="d-flex px-2">
                      <div class="my-auto">
                        <h6 class="mb-0 text-sm">{{ user.email }}</h6>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p class="text-sm font-weight-bold mb-0">{{ formatShortDate(user.createdAt) }}</p>
                  </td>
                  <td>
                    <p class="text-sm font-weight-bold mb-0">
                      {{ translateStatus(user.status) }}
                    </p>
                  </td>
                  <td>
                    <span class="text-sm font-weight-bold">{{ user.role }}</span>
                  </td>
                  <td class="align-middle text-center">
                    <button class="btn btn-link text-secondary mb-0" @click="editUser(user)">
                      <i class="fa fa-edit text-xs" aria-hidden="true"></i> Editar
                    </button>
                    <button class="btn btn-link text-danger mb-0" @click="confirmDeleteUser(user.id)">
                      <i class="fa fa-trash text-xs" aria-hidden="true"></i> Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Formulario de edición -->
      <div v-if="isEditing" class="card mt-4">
        <div class="card-header">
          <h5 class="mb-0">Editar Usuario</h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="saveUser">
            <div class="form-group mb-3">
              <label>Correo Electrónico</label>
              <input v-model="selectedUser.email" type="email" class="form-control" disabled />
            </div>
            <div class="form-group mb-3">
              <label>Estado</label>
              <select v-model="selectedUser.status" class="form-control">
                <option value="on">Activo</option>
                <option value="off">Desactivado</option>
              </select>
            </div>
            <div class="form-group mb-3">
              <label>Rol</label>
              <select v-model="selectedUser.role" class="form-control">
                <option value="Administrador">Administrador</option>
                <option value="Cajero">Cajero</option>
                <option value="Mesero">Mesero</option>
                <option value="Recepcionista">Recepcionista</option>
              </select>
            </div>
            <div class="d-flex">
              <button type="submit" class="btn btn-success">Guardar</button>
              <button type="button" class="btn btn-secondary ms-3" @click="cancelEdit">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default {
  data() {
    return {
      users: [], // Lista de usuarios
      filteredUsers: [], // Lista de usuarios filtrados
      filterEmail: '', // Correo electrónico para filtrar
      isEditing: false, // Controla si se está editando un usuario
      selectedUser: null, // Usuario seleccionado para editar
    };
  },
  methods: {
    // Función para cargar usuarios desde Firestore
    async fetchUsers() {
      const querySnapshot = await getDocs(collection(db, "users"));
      this.users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.filteredUsers = this.users; // Inicializa la lista filtrada
    },
    // Filtra los usuarios por correo electrónico
    filterUsers() {
      const filter = this.filterEmail.toLowerCase();
      this.filteredUsers = this.users.filter((user) => user.email.toLowerCase().includes(filter));
    },
    // Traduce el estado a español
    translateStatus(status) {
      if (status === "on") return "Activo";
      if (status === "off") return "Desactivado";
      return "Desconocido";
    },
    // Formatea la fecha al formato dd/mm/aaaa
    formatShortDate(timestamp) {
      if (!timestamp) return "N/D";
      const date = new Date(timestamp.seconds * 1000);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    // Habilita el modo de edición y carga el usuario seleccionado
    editUser(user) {
      this.selectedUser = { ...user };
      this.isEditing = true;
    },
    // Actualiza el estado del usuario
    async updateStatus(user) {
      try {
        const userDoc = doc(db, "users", user.id);
        await updateDoc(userDoc, {
          status: user.status,
        });
        this.fetchUsers(); // Recarga los datos
      } catch (error) {
        console.error("Error actualizando estado del usuario:", error);
      }
    },
    // Guarda los cambios del usuario editado
    async saveUser() {
      try {
        const userDoc = doc(db, "users", this.selectedUser.id);
        await updateDoc(userDoc, {
          status: this.selectedUser.status,
          role: this.selectedUser.role,
        });
        this.isEditing = false;
        this.selectedUser = null;
        this.fetchUsers(); // Recarga los datos
      } catch (error) {
        console.error("Error actualizando usuario:", error);
      }
    },
    // Cancela la edición
    cancelEdit() {
      this.isEditing = false;
      this.selectedUser = null;
    },
    // Confirma antes de eliminar un usuario
    confirmDeleteUser(id) {
      if (confirm("¿Estás seguro de eliminar este usuario?")) {
        this.deleteUser(id);
      }
    },
    // Elimina un usuario
    async deleteUser(id) {
      try {
        await deleteDoc(doc(db, "users", id));
        this.users = this.users.filter((user) => user.id !== id);
        this.filterUsers(); // Actualiza la lista filtrada
      } catch (error) {
        console.error("Error eliminando usuario:", error);
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>
