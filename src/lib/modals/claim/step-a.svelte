<script>
	import { createEventDispatcher } from 'svelte';
	import RobloxUserSearch from '$lib/components/RobloxUserSearch.svelte';

	const dispatch = createEventDispatcher();

	function handleUserSelected(event) {
		const selectedUser = event.detail.user;
		dispatch('confirm', { 
			robloxUser: selectedUser
		});
	}
</script>

<div class="w-full space-y-4">
	<div class="space-y-2">
		<h2 class="text-xl font-semibold text-transparent bg-gradient-to-r from-white to-white/70 bg-clip-text">
			Link Your Roblox Account
		</h2>
		<p class="text-sm text-[#809BB5]">
			Search and select your Roblox account to continue the verification process.
		</p>
	</div>

	<div class="mt-6">
		<RobloxUserSearch on:userSelected={handleUserSelected} />
	</div>
</div>
