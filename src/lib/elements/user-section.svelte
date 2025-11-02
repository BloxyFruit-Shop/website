<script>
  import AuthModal from "$lib/modals/auth/index.svelte"
  import { Select } from "bits-ui"
  import { ArrowDown, User, Logout, RoundedArrowRight } from "$icons"
  import { flyAndScale } from "$lib/utils"
  import Button from "$components/Button.svelte"
  import { page } from "$app/stores"
  import { onMount } from "svelte"

  export let data
  
  let resetCode
  let claimOrder
  let authModalOpen = resetCode != null
  let authModal = resetCode != null ? "reset" : "main" // [main - sign up, login] [forgot - forgot password] [reset - reset password]
  let authModalType = resetCode != null ? "Reset Password" : "Register"

  onMount(() => {
    const loggedNotVerified = data.localUser && data.localUser.status == 1
    resetCode = $page.url.searchParams.get("resetCode")
    claimOrder = $page.url.searchParams.get("claimOrder")
    authModalOpen = loggedNotVerified || resetCode != null || claimOrder != null
    authModal = loggedNotVerified ? "main" : resetCode != null ? "reset" : "main" // [main - sign up, login] [forgot - forgot password] [reset - reset password] [claim - claim order]
    authModalType = loggedNotVerified ? "Verify Email" : resetCode != null ? "Reset Password" : "Register"
  })
</script>

<div>
  {#if data.localUser}
    <div class="flex items-center gap-3.5">
      <Select.Root>
        <Select.Trigger class="h-[46px] px-1.5 flex items-center bg-[#1D2535] rounded-lg group">
          <div class="bg-white/8 p-0.5 rounded-full">
            <div class="overflow-hidden rounded-full size-8">
              <img src="/assets/bacon-headshot.webp" alt="Avatar" class="size-full" />
            </div>
          </div>
          <div class="flex flex-col gap-0.5 ml-2 text-left max-[600px]:hidden">
            <p class="font-semibold leading-none text-white">{data.localUser.username}</p>
          </div>
          <ArrowDown class="ml-1 text-white transition-transform size-5 group-aria-expanded:rotate-180" />
        </Select.Trigger>
        <Select.Content
          class="!w-[170px] rounded-lg bg-[#1D2535] p-2 shadow-popover outline-none z-[160] font-medium"
          transition={flyAndScale}
          sideOffset={8}
        >
          <Select.Item value="account">
            <a class="flex items-center px-3 py-2 font-semibold text-white transition-colors rounded-md hover:bg-white/5" href="/account">
              <User class="size-4 mr-2.5" />
              <p>Account</p>
            </a>
          </Select.Item>
          <Select.Item value="logout">
            <a class="flex items-center text-[#D64545] font-bold py-2 px-3 hover:bg-white/5 rounded-md transition-colors" href="/logout">
              <Logout class="size-4 mr-2.5" />
              <p>Logout</p>
            </a>
          </Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  {:else}
    <Button 
      color="accent" variant="gradient" 
      onClick={() => { authModalOpen = true; authModal = "main"; authModalType = "Register" }}
      class="max-md:px-4 h-[46px]"
    >
      <p class="hidden sm:block">Get Started!</p>
      <RoundedArrowRight class="size-4 sm:ml-1.5" />
    </Button>
  {/if}
  
  <AuthModal 
    bind:open={authModalOpen}
    bind:modal={authModal}
    bind:modalType={authModalType}
    forms={data.forms}
  />
</div>