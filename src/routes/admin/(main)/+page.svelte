<script>
  import { bgBlur } from "$lib/utils";
  import { Hammer } from "$lib/icons";
</script>

<div class="max-w-[1440px] w-full mx-auto">
  <div class="w-full p-6 rounded-lg" style="{bgBlur({ color: '#111A28', blur: 6, opacity: 0.9 })}">
    <div class="flex items-center gap-2">
      <Hammer class="w-8 h-8" />
      <h1 class="text-2xl font-bold">Dashboard</h1>
    </div>

    <div class="w-full h-[3px] bg-[#1D2535] my-5 rounded-full"></div>

    <div class="flex flex-col items-center justify-center py-12 text-center">
      <Hammer class="w-16 h-16 text-[#3BA4F0] mb-4" />
      <h2 class="text-2xl font-bold mb-2">Work in Progress</h2>
      <p class="text-[#809BB5] font-medium">This section is currently under development.</p>
    </div>
  </div>
</div>

  