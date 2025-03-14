<script>
  import { Dialog } from "bits-ui"
  import { fade } from "svelte/transition"
  import Button from "$components/Button.svelte"
  import Close from "$icons/close.svelte"
  import { ArrowRight } from "$icons"

  export let open
</script>

<Dialog.Root bind:open={open}>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fade}
      transitionConfig={{ duration: 150 }}
      class="fixed inset-0 z-[150] bg-[#0C0E16]/80"
    />

    <Dialog.Content
      class="
        bg-[#131620] overflow-hidden rounded-xl fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 outline-none z-[170] w-full min-[870px]:max-w-[400px] xl:min-w-[400px] max-[869px]:h-full min-[870px]:max-h-[calc(100%-40px)] flex flex-col min-[870px]:flex-row
        duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
      "
    >
      <Dialog.Close class="absolute top-6 right-6">
        <Close class="size-[22px]" strokeWidth={2} />
      </Dialog.Close>
      <div class="size-72 bg-[#3BA4F0]/10 blur-[100px] absolute -top-36 -left-36 z-[-1]"></div>
      <div class="flex flex-col p-6 w-full">
        <h1 class="font-semibold text-xl">Oops! Cart Error!</h1>
        <p class="font-semibold mt-6">Your cart contains items from a different game. Please remove them before adding items from any other game.</p>
        <Button variant="gradient" color="accent" class="w-full" wrapperClass="mt-12">
          Remove other items
          <ArrowRight class="size-4 ml-1.5" />
        </Button>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>