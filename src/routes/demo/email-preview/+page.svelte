<script lang="ts">
	let { data } = $props();
</script>

<div class="min-h-screen bg-gray-100 p-8 flex flex-col items-center gap-8">
	<h1 class="text-2xl font-bold text-gray-800">Email Preview</h1>
	
	<div class="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
		<div class="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
			<span class="text-sm font-mono text-gray-500">Subject: Kode verifikasi masuk Yaa Qeen Anda</span>
		</div>
		<div class="h-[600px] w-full">
			<iframe 
				srcdoc={data.otpHtml} 
				title="OTP Email Preview" 
				class="w-full h-full border-0"
			></iframe>
		</div>
	</div>

	<div class="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
		<div class="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
			<span class="text-sm font-mono text-gray-500">Subject: Masuk ke Yaa Qeen</span>
		</div>
		<div class="h-[600px] w-full">
			<iframe 
				srcdoc={data.magicLinkHtml} 
				title="Magic Link Email Preview" 
				class="w-full h-full border-0"
			></iframe>
		</div>
	</div>
</div>
