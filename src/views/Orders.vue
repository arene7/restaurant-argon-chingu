<script setup>
import BookTable from "./components/BookTable.vue";
import ListOrders from "./components/ListOrders.vue";
import InvoiceGenerator from "./components/InvoiceGenerator.vue";


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
             <invoice-generator />
          </div>
        </div>
        <div class="col-lg-5 mb-4">
          <div class="card">
            <book-table />
          </div>
        </div>
      </div>
    </div>
  </template>
  