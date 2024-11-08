<template>
  <div>
    <!-- Encabezado con botón para agregar producto -->
    <div class="card mb-4">
      <div class="card-header pb-0 d-flex justify-content-between align-items-center">
        <h6>Menu Items</h6>
        <button v-if="!showAddProductForm" class="btn btn-primary btn-sm" @click="openAddProductForm">
          Add New Product
        </button>
      </div>

      <!-- Tabla de productos -->
      <div v-if="!showAddProductForm" class="card-body px-0 pt-0 pb-2">
        <div class="table-responsive p-0">
          <table class="table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Product</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Price</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Description</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Category</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td>
                  <div class="d-flex px-2">
                    <div>
                      <img :src="product.image" class="avatar avatar-sm rounded-circle me-2" :alt="product.name" />
                    </div>
                    <div class="my-auto">
                      <h6 class="mb-0 text-sm">{{ product.name }}</h6>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="text-sm font-weight-bold mb-0">${{ product.price }}</p>
                </td>
                <td>
                  <p class="text-sm mb-0">{{ product.description }}</p>
                </td>
                <td>
                  <span class="text-xs font-weight-bold">{{ product.category }}</span>
                </td>
                <td class="align-middle text-center">
                  <button class="btn btn-link text-secondary mb-0" @click="editProduct(product)">
                    <i class="fa fa-edit text-xs" aria-hidden="true"></i> Edit
                  </button>
                  <button class="btn btn-link text-danger mb-0" @click="confirmDeleteProduct(product.id)">
                    <i class="fa fa-trash text-xs" aria-hidden="true"></i> Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Formulario para agregar/editar producto -->
      <div v-if="showAddProductForm" class="card-body px-4">
        <h5>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h5>
        <form @submit.prevent="editingProduct ? saveProductChanges() : createProduct()">
          <div class="form-group mb-3">
            <label>Name</label>
            <input v-model="form.name" class="form-control" required />
          </div>
          <div class="form-group mb-3">
            <label>Price</label>
            <input type="number" v-model="form.price" class="form-control" required />
          </div>
          <div class="form-group mb-3">
            <label>Description</label>
            <textarea v-model="form.description" class="form-control" required></textarea>
          </div>
          <div class="form-group mb-3">
            <label>Category</label>
            <input v-model="form.category" class="form-control" required />
          </div>
          <div class="form-group mb-3">
            <label>Image URL</label>
            <input v-model="form.image" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-success">
            {{ editingProduct ? 'Update Product' : 'Add Product' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="closeAddProductForm">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default {
  data() {
    return {
      products: [],
      showAddProductForm: false,
      editingProduct: null,
      form: {
        name: '',
        price: 0,
        description: '',
        category: '',
        image: ''
      },
    };
  },
  methods: {
    async fetchProducts() {
      const querySnapshot = await getDocs(collection(db, "menuItems"));
      this.products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    openAddProductForm() {
      this.resetForm();
      this.showAddProductForm = true;
      this.editingProduct = null;
    },
    async createProduct() {
      try {
        await addDoc(collection(db, "menuItems"), this.form);
        await this.fetchProducts();
        this.closeAddProductForm();
      } catch (error) {
        console.error("Error creating product:", error);
      }
    },
    editProduct(product) {
      this.editingProduct = product;
      this.form = { ...product };
      this.showAddProductForm = true;
    },
    async saveProductChanges() {
      if (!this.editingProduct) return;
      try {
        const productRef = doc(db, "menuItems", this.editingProduct.id);
        await updateDoc(productRef, this.form);
        await this.fetchProducts();
        this.closeAddProductForm();
      } catch (error) {
        console.error("Error updating product:", error);
      }
    },
    closeAddProductForm() {
      this.showAddProductForm = false;
      this.resetForm();
    },
    confirmDeleteProduct(id) {
      if (confirm("Are you sure you want to delete this product?")) {
        this.deleteProduct(id);
      }
    },
    async deleteProduct(id) {
      try {
        await deleteDoc(doc(db, "menuItems", id));
        this.products = this.products.filter(product => product.id !== id);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    },
    resetForm() {
      this.form = {
        name: '',
        price: 0,
        description: '',
        category: '',
        image: ''
      };
    }
  },
  mounted() {
    this.fetchProducts();
  }
};
</script>
