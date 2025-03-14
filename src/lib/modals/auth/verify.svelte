<script>
  import { superForm } from "sveltekit-superforms/client"
  import { valibotClient } from 'sveltekit-superforms/adapters'
  import { verifySchema } from "$lib/schemes"
  import Button from "$components/Button.svelte"
  import Input from "$components/Input.svelte"
  import ArrowRight from "$icons/arrow-right.svelte"
  import { toast } from "$lib/svoast"

  export let forms
  export let setModalOpen

  const { form: verifyForm, enhance: verifyEnhance, errors: verifyErrors, submitting: verifySubmitting } = superForm(forms.verify, {
    resetForm: false, dataType: "json",
    validators: valibotClient(verifySchema),
    onResult: (data) => {
      if(data?.result?.data?.form?.message) 
        toast[data.result.status == 200 ? "success" : "error"](data.result.data.form.message, { duration: 5_000 })

      if(data.result.status == 200) 
        setModalOpen(false)
    }
  })
</script>

<h1 class="font-semibold text-xl">Verify Account</h1>
<p class="text-[#809BB5] font-medium">
  Check your email for a verification code.
</p>

<form method="POST" class="flex flex-col mt-6 w-full flex-1" action="/actions?/verify" use:verifyEnhance>
  <Input 
    name="code"
    label="Code" 
    placeholder="Please enter the code" 
    bind:value={$verifyForm.code}
    helperText={$verifyErrors.code}
    error={$verifyErrors.code != null}
  />

  <!-- <p class="text-[#809BB5] font-medium mt-4">
    Forgot password?&nbsp;
    <button 
      class="underline decoration-[#3BA4F0]/60 hover:decoration-[#3BA4F0] text-[#3BA4F0] transition-colors"
      on:click={() => { setModal("forgot"); setModalType("Forgot Password") }}
    >
      Recover it here.
    </button>
  </p> -->

  <Button variant="gradient" color="accent" class="w-full" wrapperClass="mt-12" type="submit" loading={$verifySubmitting}>
    Submit
    <ArrowRight class="size-4 ml-1.5" />
  </Button>
</form>