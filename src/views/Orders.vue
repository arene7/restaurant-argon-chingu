<script setup>
import BookTable from "./components/BookTable.vue";
import ListOrders from "./components/ListOrders.vue";
</script>

<template>
    <div class="py-4 container-fluid">
      <div class="row">
        <div class="col-12">
          <list-orders />
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-lg-7 mb-lg-0 mb-4">
          <div class="card">
            <book-table />
          </div>
        </div>
        <div class="col-lg-5 mb-4">
          <div class="card">
            <div class="card-body">
              <h6 class="card-title">Tables capacity</h6>
              <p class="card-text">Status tables . ...</p>
              <!-- <diamond-icons />  -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  