export const manifest: overwolf.extensions.Manifest = {
    UID: "samplea-app",
    manifest_version: 1,
    type: "WebApp",
    permissions: ["GameInfo", "Hotkeys"],
    max_rotation_log_files:20,

    meta: {
        name: "first app",
        author: "author name",
        version: "0.0.0.1",
        "minimum-overwolf-version": "0.204.2.2",
        description: "A plain text description",
        dock_button_title: "first app",
        icon: "icons/747px-Svelte_Logo.svg.png",
        icon_gray: "icons/747px-Svelte_Logo.svg.png",
        launcher_icon: "icons/747px-Svelte_Logo.svg.ico",
        splash_image: "icons/747px-Svelte_Logo.svg.png",
        window_icon: "icons/747px-Svelte_Logo.svg.png",
    },
    data: {
        start_window: "background",
        game_targeting: {
            type: "dedicated",
            game_ids: [108681, 108682, 108683, 108684] //https://overwolf.github.io/api/games/ids#the-gamelistxml-file
        },
        windows: {
            "background": {
                file: "background.mts",
                background_optimization: false,
                is_background_page: true,
                debug_url: "localhost:11101",
                optimize_accelerate_rendering: true,
                disable_auto_dpi_sizing: false,
                restrict_to_game_bounds: false,
                disable_hardware_acceleration: false
            },
            "in_game": {
                file: "In_game.svelte",
                transparent: false,
                debug_url: "localhost:11102",
                show_in_taskbar: false,
                in_game_only: true,
                clickthrough: false,
                optimize_accelerate_rendering: true,
                disable_auto_dpi_sizing: false,
                restrict_to_game_bounds: false,
                disable_hardware_acceleration: false,
                size: {
                    width: 500,
                    height: 500,
                },
            },
            "desktop": {
                file: "Desktop.svelte",
                desktop_only: true,
                native_window: true,
                size: {
                    width: 500,
                    height: 500,
                },
                debug_url: "localhost:11103",
                optimize_accelerate_rendering: true,
                disable_auto_dpi_sizing: false,
                restrict_to_game_bounds: false,
                disable_hardware_acceleration: false
            }
        }
    }
}
