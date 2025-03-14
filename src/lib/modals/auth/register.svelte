<script>
  import { superForm } from "sveltekit-superforms/client"
  import { valibotClient } from 'sveltekit-superforms/adapters'
  import { registerSchema } from "$lib/schemes"
  import Button from "$components/Button.svelte"
  import Input from "$components/Input.svelte"
  import ArrowRight from "$icons/arrow-right.svelte"
  import Google from "$icons/google.svelte"
  import Checkbox from "$components/Checkbox.svelte"
  import { toast } from "$lib/svoast"
  import EyeOff from "$icons/eye-off.svelte"
  import Eye from "$icons/eye.svelte"

  export let forms
  export let setModalOpen
  export let setModalType

  let passwordVisible

  const { form: registerForm, enhance: registerEnhance, errors: registerErrors, submitting: registerSubmitting } = superForm(forms.register, {
    resetForm: false, dataType: "json",
    validators: valibotClient(registerSchema),
    onResult: (data) => {
      if(data?.result?.data?.form?.message) 
        toast[data.result.status == 200 ? "success" : "error"](data.result.data.form.message, { duration: 5_000 })

      if(data.result.status == 200) 
        setModalOpen(false)
    }
  })
</script>

<h1 class="font-semibold text-xl">Get Started!</h1>
<p class="text-[#809BB5] font-medium">
  Already have an account?&nbsp;
  <button 
    class="underline decoration-[#3BA4F0]/60 hover:decoration-[#3BA4F0] text-[#3BA4F0] transition-colors"
    on:click={() => { setModalType("Login") }}
  >
    Login Here.
  </button>
</p>

<form method="POST" class="flex flex-col mt-6 w-full flex-1" action="/actions?/register" use:registerEnhance>
  <Input 
    name="username"
    label="Username" 
    placeholder="Please choose an username"
    bind:value={$registerForm.username}
    helperText={$registerErrors.username}
    error={$registerErrors.username != null}
  />
  <Input 
    name="email"
    label="Email" 
    placeholder="Please choose an email" 
    divClass="mt-4"
    bind:value={$registerForm.email}
    helperText={$registerErrors.email}
    error={$registerErrors.email != null}
  />
  <Input 
    name="password"
    label="Password" 
    type={passwordVisible ? "text" : "password"}
    placeholder="Please choose an email" 
    divClass="mt-4"
    bind:value={$registerForm.password}
    helperText={$registerErrors.password}
    error={$registerErrors.password != null}
  >
    <Button slot="endIcon" class="size-[30px]" icon variant="text" color="zinc" size="small" onClick={() => (passwordVisible = !passwordVisible)}>
      {#if passwordVisible}
        <EyeOff class="size-5 text-[#809BB5]" size="small"/>
      {:else}
        <Eye class="size-5 text-[#809BB5]" size="small"/>
      {/if}
    </Button>
  </Input>

  <Checkbox wrapperClass="mt-4">
    <p class="text-[#809BB5] text-sm font-semibold">
      I agree to the 
      <a class="underline decoration-[#3BA4F0]/60 hover:decoration-[#3BA4F0] text-[#3BA4F0] transition-colors" href="/tos" target="_blank">Terms of Service</a>
      and 
      <a class="underline decoration-[#3BA4F0]/60 hover:decoration-[#3BA4F0] text-[#3BA4F0] transition-colors" href="/privacy-policy" target="_blank">Privacy Policy.</a>
    </p>
  </Checkbox>

  <Button variant="gradient" color="accent" class="w-full" wrapperClass="mt-12" type="submit" loading={$registerSubmitting}>
    Get Started
    <ArrowRight class="size-4 ml-1.5" />
  </Button>
  <div class="flex items-center gap-3 text-[#809BB5] font-semibold my-3">
    <div class="flex-1 h-0.5 bg-[#809BB5]"></div>
    <p>or continue with</p>
    <div class="flex-1 h-0.5 bg-[#809BB5]"></div>
  </div>
  <Button variant="contained" color="gray" class="w-full" disabled>
    <Google class="size-[18px] mr-1.5" />
    Sign Up with Google
  </Button>
</form>