<script setup>
import ReservationsList from "./components/ReservationsList.vue";
import AddReservation from "./components/AddReservation.vue";
import DiamondIcons from "./components/DiamondIcons.vue"; // Importa el nuevo componente
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <reservations-list />
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-lg-7 mb-lg-0 mb-4">
        <div class="card">
          <add-reservation />
        </div>
      </div>
      <div class="col-lg-5 mb-4">
        <div class="card">
          <div class="card-body">
            <diamond-icons /> 
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
