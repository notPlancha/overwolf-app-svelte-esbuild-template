//  TODO finish manifest
export const manifest: overwolf.extensions.Manifest = {
    UID: "",
    data: {
        start_window: "background",
        hotkeys:{
            "sample": {
                title: "Show/Hide In-Game Window",
                "action-type": "toggle",
                "default": "CTRL+F"
            }
        },
        windows: {
            background: {

            },
            desktop:{

            },
            in_game:{

            }
        }
    },
    manifest_version: 1,
    max_rotation_log_files: 0,
    meta: {
        "minimum-overwolf-version": "",
        author: "",
        description: "",
        dock_button_title: "",
        icon: "",
        icon_gray: "",
        launcher_icon: "",
        name: "",
        splash_image: "",
        version: "",
        window_icon: ""
    },
    permissions: [
        "Hotkeys",
    ],
    type: "WebApp"
}
