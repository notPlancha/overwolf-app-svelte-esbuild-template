<script>
    import Header from "./assets/Header.svelte";
    import {OWWindow} from "@overwolf/overwolf-api-ts/dist";
    import Counter from "./assets/Counter.svelte";
    import { AppController } from "./background";
    const appController = AppController.getInstance()
    let desktopWindow : OWWindow = appController.desktopWindow;
</script>

<style lang="scss">
    main{
      padding: 12px;
      text-align: center; /* TODO check if this centers the objects */
    }
</style>

<Header window={desktopWindow}/>
<main>
    <h1>Hello from Desktop!</h1>
    <Counter/>
</main>
