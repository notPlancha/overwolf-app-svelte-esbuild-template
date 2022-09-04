<script lang="ts">
    let counter: number = 0
</script>

<button on:click={() => {counter+=1}}>
    <span>Counter: {counter}</span>
</button>
