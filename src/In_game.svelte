<script lang="ts">
    import Header from "./assets/Header.svelte";
    import {OWWindow} from "@overwolf/overwolf-api-ts/dist";
    import Counter from "./assets/Counter.svelte";
    import { AppController } from "./background.mjs";
    const appController = AppController.getInstance()
    let desktopWindow : OWWindow = appController.desktopWindow;
    //TODO add event logger for template
</script>

<style lang="scss">
  main{
    padding: 12px;
    text-align: center; /* TODO check if this centers the objects */
  }
</style>

<Header window={desktopWindow}/>
<main>
    <h1>Hello from In_game!</h1>
    <Counter />
</main>
