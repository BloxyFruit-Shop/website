<script>
  import { superForm } from "sveltekit-superforms/client"
  import { valibotClient } from 'sveltekit-superforms/adapters'
  import { resetPasswordSchema } from "$lib/schemes"
  import Button from "$components/Button.svelte"
  import Input from "$components/Input.svelte"
  import ArrowRight from "$icons/arrow-right.svelte"
  import { toast } from "$lib/svoast"
  import EyeOff from "$icons/eye-off.svelte"
  import Eye from "$icons/eye.svelte"

  export let forms
  export let setModalOpen

  let passwordVisible

  const { form: resetPasswordForm, enhance: resetPasswordEnhance, errors: resetPasswordErrors, submitting: resetPasswordSubmitting } = superForm(forms.resetPassword, {
    resetForm: false, dataType: "json",
    validators: valibotClient(resetPasswordSchema),
    onResult: (data) => {
      if(data?.result?.data?.form?.message) 
        toast[data.result.status == 200 ? "success" : "error"](data.result.data.form.message, { duration: 5_000 })

      if(data.result.status == 200) 
        setModalOpen(false)
    }
  })
</script>

<h1 class="font-semibold text-xl">Reset Your Password</h1>
<p class="text-[#809BB5] font-medium">
  Please enter your new password below.
</p>

<form method="POST" class="flex flex-col mt-6 w-full flex-1" action="/actions?/resetPassword" use:resetPasswordEnhance>
  <input 
    type="hidden" 
    name="code" 
    bind:value={$resetPasswordForm.code}
  />
  
  <Input 
    name="password"
    label="Password" 
    type={passwordVisible ? "text" : "password"}
    placeholder="Please choose a password" 
    divClass="mt-4"
    bind:value={$resetPasswordForm.password}
    helperText={$resetPasswordErrors.password}
    error={$resetPasswordErrors.password != null}
  >
    <Button slot="endIcon" class="size-[30px]" icon variant="text" color="zinc" size="small" onClick={() => (passwordVisible = !passwordVisible)}>
      {#if passwordVisible}
        <EyeOff class="size-5 text-[#809BB5]" size="small"/>
      {:else}
        <Eye class="size-5 text-[#809BB5]" size="small"/>
      {/if}
    </Button>
  </Input>

  <Input 
    name="confirmPassword"
    label="Confirm Password" 
    type={passwordVisible ? "text" : "password"}
    placeholder="Please confirm your password" 
    divClass="mt-4"
    bind:value={$resetPasswordForm.confirmPassword}
    helperText={$resetPasswordErrors.confirmPassword}
    error={$resetPasswordErrors.confirmPassword != null}
  >
    <Button slot="endIcon" class="size-[30px]" icon variant="text" color="zinc" size="small" onClick={() => (passwordVisible = !passwordVisible)}>
      {#if passwordVisible}
        <EyeOff class="size-5 text-[#809BB5]" size="small"/>
      {:else}
        <Eye class="size-5 text-[#809BB5]" size="small"/>
      {/if}
    </Button>
  </Input>

  <Button variant="gradient" color="accent" class="w-full" wrapperClass="mt-12" type="submit" loading={$resetPasswordSubmitting}>
    Reset Password
    <ArrowRight class="size-4 ml-1.5" />
  </Button>
</form>