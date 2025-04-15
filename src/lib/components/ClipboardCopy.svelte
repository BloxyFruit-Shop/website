<script>
  import { toast } from "$lib/svoast"
  import { Link } from "$lib/icons"
  export let copy = undefined;
  export let successMessage = 'Copied to clipboard!';
  
  async function copyToClipboard() {
    const valueToCopy = copy !== undefined ? copy : '';
    
    try {
      await navigator.clipboard.writeText(valueToCopy);
      
      toast.success(successMessage, { duration: 2000 });
    } catch (err) {
      toast.error('Failed to copy to clipboard', { duration: 2000 });
    }
  }
</script>

<div 
  {...$$restProps}
  class={"relative inline-flex cursor-pointer flex-nowrap items-center hover:opacity-90 gap-1 " + $$props.class}
  on:click={copyToClipboard}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === 'Enter' && copyToClipboard()}
>
  <slot></slot>
</div>