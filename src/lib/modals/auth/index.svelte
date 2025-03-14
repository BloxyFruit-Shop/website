<script>
  import Dialog from "$lib/modals/index.svelte"
  import { fade } from "svelte/transition"
  import Close from "$icons/close.svelte"

  import Register from "./register.svelte"
  import Login from "./login.svelte"
  import ForgotPassword from "./forgot-password.svelte"
  import ResetPassword from "./reset-password.svelte"
  import VerifyEmail from "./verify.svelte"
  const modals = {
    "main": {
      "types": [ "Register", "Login", "Verify Email" ]
    },
    "forgot": {
      "types": [ "Forgot Password", "Back To Login" ]
    },
    "reset": {
      "types": [ "Reset Password", "Back To Login" ]
    }
  }

  const modalComponents = {
    "Register": Register,
    "Login": Login,
    "Forgot Password": ForgotPassword,
    "Reset Password": ResetPassword,
    "Verify Email": VerifyEmail
  }

  export let open
  export let modal
  export let modalType
  export let forms

  function setModalOpen(value) { open = value }
  function setModalType(type) { modalType = type }
  function setModal(type) { modal = type }
</script>

<Dialog bind:open={open}>
  <svelte:component 
    this={modalComponents[modalType]} 
    {forms} {setModalType} {setModal} {setModalOpen}
    bind:open 
  />
</Dialog>