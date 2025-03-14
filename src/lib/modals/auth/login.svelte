<script>
  import { superForm } from "sveltekit-superforms/client"
  import { valibotClient } from 'sveltekit-superforms/adapters'
  import { loginSchema } from "$lib/schemes"
  import Button from "$components/Button.svelte"
  import Input from "$components/Input.svelte"
  import ArrowRight from "$icons/arrow-right.svelte"
  import Google from "$icons/google.svelte"
  import { toast } from "$lib/svoast"
  import EyeOff from "$icons/eye-off.svelte"
  import Eye from "$icons/eye.svelte"

  export let forms
  export let setModalOpen
  export let setModal
  export let setModalType

  let passwordVisible

  const { form: loginForm, enhance: loginEnhance, errors: loginErrors, submitting: loginSubmitting } = superForm(forms.login, {
    resetForm: false, dataType: "json",
    validators: valibotClient(loginSchema),
    onResult: (data) => {
      if(data?.result?.data?.form?.message) 
        toast[data.result.status == 200 ? "success" : "error"](data.result.data.form.message, { duration: 5_000 })

      if(data.result.status == 200) 
        setModalOpen(false)
      // if(customFunction) customFunction(data)
    }
  })
</script>

<h1 class="font-semibold text-xl">Welcome Back!</h1>
<p class="text-[#809BB5] font-medium">
  Don't have an account?&nbsp;
  <button 
    class="underline decoration-[#3BA4F0]/60 hover:decoration-[#3BA4F0] text-[#3BA4F0] transition-colors"
    on:click={() => { setModalType("Register") }}
  >
    Register Here.
  </button>
</p>

<form method="POST" class="flex flex-col mt-6 w-full flex-1" action="/actions?/login" use:loginEnhance>
  <Input 
    name="identifier"
    label="Username/Email" 
    placeholder="Please choose an email" 
    bind:value={$loginForm.identifier}
    helperText={$loginErrors.identifier}
    error={$loginErrors.identifier != null}
  />
  <Input 
    name="password"
    label="Password" 
    type={passwordVisible ? "text" : "password"}
    placeholder="Please choose an email" 
    divClass="mt-4"
    bind:value={$loginForm.password}
    helperText={$loginErrors.password}
    error={$loginErrors.password != null}
  >
    <Button slot="endIcon" class="size-[30px]" icon variant="text" color="zinc" size="small" onClick={() => (passwordVisible = !passwordVisible)}>
      {#if passwordVisible}
        <EyeOff class="size-5 text-[#809BB5]" size="small"/>
      {:else}
        <Eye class="size-5 text-[#809BB5]" size="small"/>
      {/if}
    </Button>
  </Input>

  <p class="text-[#809BB5] font-medium mt-4">
    Forgot password?&nbsp;
    <button 
      class="underline decoration-[#3BA4F0]/60 hover:decoration-[#3BA4F0] text-[#3BA4F0] transition-colors"
      on:click={() => { setModal("forgot"); setModalType("Forgot Password") }}
    >
      Recover it here.
    </button>
  </p>

  <Button variant="gradient" color="accent" class="w-full" wrapperClass="mt-12" type="submit" loading={$loginSubmitting}>
    Log In
    <ArrowRight class="size-4 ml-1.5" />
  </Button>
  <div class="flex items-center gap-3 text-[#809BB5] font-semibold my-3">
    <div class="flex-1 h-0.5 bg-[#809BB5]"></div>
    <p>or continue with</p>
    <div class="flex-1 h-0.5 bg-[#809BB5]"></div>
  </div>
  <Button variant="contained" color="gray" class="w-full" disabled>
    <Google class="size-[18px] mr-1.5" />
    Log In with Google
  </Button>
</form>