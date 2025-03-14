<script>
  import { superForm } from "sveltekit-superforms/client"
  import { valibotClient } from 'sveltekit-superforms/adapters'
  import { forgotPasswordSchema } from "$lib/schemes"
  import Button from "$components/Button.svelte"
  import Input from "$components/Input.svelte"
  import ArrowRight from "$icons/arrow-right.svelte"
  import Google from "$icons/google.svelte"
  import Checkbox from "../../components/Checkbox.svelte"
  import { toast } from "$lib/svoast"

  export let forms
  export let setModalOpen
  export let setModalType

  const { form: forgotPasswordForm, enhance: forgotPasswordEnhance, errors: forgotPasswordErrors, submitting: forgotPasswordSubmitting } = superForm(forms.forgotPassword, {
    resetForm: false, dataType: "json",
    validators: valibotClient(forgotPasswordSchema),
    onResult: (data) => {
      if(data?.result?.data?.form?.message)
        toast[data.result.status == 200 ? "success" : "error"](data.result.data.form.message, { duration: 5_000 })

      if(data.result.status == 200) setModalOpen(false)
    }
  })
</script>

<h1 class="font-semibold text-xl">Forgot Your Password?</h1>
<p class="text-[#809BB5] font-medium">
  Remembered your password?&nbsp;
  <button 
    class="underline decoration-[#3BA4F0]/60 hover:decoration-[#3BA4F0] text-[#3BA4F0] transition-colors"
    on:click={() => { setModalType("Login") }}
  >
    Login Here.
  </button>
</p>

<form method="POST" class="flex flex-col mt-6 w-full flex-1" action="/actions?/forgotPassword" use:forgotPasswordEnhance>
  <Input 
    name="email"
    label="Email" 
    placeholder="Please choose an email" 
    bind:value={$forgotPasswordForm.email}
    helperText={$forgotPasswordErrors.email}
    error={$forgotPasswordErrors.email != null}
  />

  <Button variant="gradient" color="accent" class="w-full" wrapperClass="mt-12" type="submit" loading={$forgotPasswordSubmitting}>
    Send Link
    <ArrowRight class="size-4 ml-1.5" />
  </Button>
</form>