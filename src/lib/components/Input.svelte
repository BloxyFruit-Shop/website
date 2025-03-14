<script>
    import cn from "$lib/utils/cn"

    let disabled = false,
      error = false,
      label = '',
      placeholder = "", 
      divClass = "",
      value,
      helperText = '',
      borderClass = '',
      type,
      name,
      onInput

    export { disabled, error, label, placeholder, onInput, divClass, borderClass, value, helperText, name, type }
</script>

<div class={divClass}>
  {#if label != ''}
    <p class={cn(
      `text-sm text-white font-semibold select-none mb-1.5`,
      disabled && "text-gray-300/70",
      error && "!text-error-500"
    )}>
      {label}
    </p>
  {/if}

  <div class={cn(
    `flex h-10 w-full rounded-md
    bg-[#1D2535]/55 px-2 py-1 text-sm text-white font-medium
    placeholder:text-[#809BB5]
    ring-1
    ring-[#1D2535]/55
    focus-within:ring-2 focus-within:ring-[#3BA4F0] transition-[box-shadow]
    disabled:cursor-not-allowed disabled:opacity-50`,
    error && "border-red-400 text-red-400",
    borderClass
  )}>
    <slot name="startIcon" />
    {#if type == "password"}
      <input
        {name}
        type="password"
        bind:value
        class={cn("bg-transparent outline-none w-full", $$props.class)}
        aria-invalid={error ? "true" : undefined}
        {disabled}
        {placeholder}
        style="-webkit-text-security: square;"
        on:input={onInput}
      />
    {:else}
      <input
        {name}
        type="text"
        bind:value
        class={cn("bg-transparent outline-none w-full", $$props.class)}
        aria-invalid={error ? "true" : undefined}
        {disabled}
        {placeholder}
        on:input={onInput}
      />
    {/if}
    <slot name="endIcon" />
  </div>

  {#if helperText && helperText != ''}
    <small class={`transition-colors duration-150 mx-1.5 mt-[3px] text-[13px] font-semibold ${error ? 'text-[#db4747]' : ''}`}>{helperText[0]}</small>
  {/if}
</div>