<script lang="ts">
    import {OWWindow} from "@overwolf/overwolf-api-ts/dist";
    export let headerIconPath: string = "img/window/header_icon.svg"
    export let window: OWWindow
    let maximized: boolean
    function setDrag(node: HTMLElement){
        window.dragMove(node)
    }
</script>

<style lang="scss">
    header {
      display: flex;
      align-items: center;
      z-index: 9999;
      background-color: #272727;
    }
    img {
      padding: {
        left: 10px;
      };
      margin: 0;
    }
    h1 {
      font: {
        style: normal;
        weight: normal;
        size: 14px;
      };
      padding: {
        left: 8px;
      };
      color: #8d8d8d;
      margin: 0;
      cursor: inherit;
    }
    button {
      background-color: transparent;
      transition: {
        duration: 0.15s;
        property: background-color;
        timing-function: ease-in-out;
      };
      :hover{
        background-color: #464646;
      }
      #closeButton:hover{
        background-color: darkred;
      }
    }
</style>

<header id="header" use:setDrag>
    <img src="{headerIconPath}" alt="header icon">
    <h1>Sample App / desktop window</h1>
    <button id="minimizeButton" on:click={() => {window.minimize()}}><img src="img/window/minimize.svg" alt="minimize button"></button>
    {#if !maximized}
        <button id="maximizeButton" on:click={() => {window.maximize()}}><img src="img/window/maximize.svg" alt="maximize button"></button>
    {:else}
        <button id="restoreButton" on:click={() => {window.restore()}}><img src="img/window/restore.svg" alt="restore button"></button>
    {/if}
    <button id="closeButton" on:click={() => {window.close()}}><img src="img/window/maximize.svg" alt="maximize button"></button>
</header>
