<script setup>
import { onMounted, ref, watch } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  editable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["update:modelValue"]);

const mapContainer = ref(null);
let map = null;
let marker = null;

onMounted(() => {
  const initialLat = props.modelValue?.lat || -33.4489;
  const initialLng = props.modelValue?.lng || -70.6693;
  
  map = L.map(mapContainer.value).setView([initialLat, initialLng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  if (props.modelValue) {
      addMarker(props.modelValue.lat, props.modelValue.lng);
  }

  if (props.editable) {
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      addMarker(lat, lng);
      emit("update:modelValue", { lat, lng });
    });
  }
});

function addMarker(lat, lng) {
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng]).addTo(map);
  }
}

watch(() => props.modelValue, (newVal) => {
    if (newVal && map && (!marker || marker.getLatLng().lat !== newVal.lat)) {
        addMarker(newVal.lat, newVal.lng);
        map.setView([newVal.lat, newVal.lng], 13);
    }
}, { deep: true });

</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
  min-height: 300px;
  border-radius: var(--radius-md);
  z-index: 1;
}
</style>
