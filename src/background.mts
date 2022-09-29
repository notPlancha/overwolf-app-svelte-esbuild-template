//TODO finish + do TODOs
import {OWGameListener, OWGames, OWWindow} from "@overwolf/overwolf-api-ts/dist";
import {manifest} from "../Manifest.mjs";
import desktop = overwolf.io.paths.desktop;
type RunningGameInfo = overwolf.games.RunningGameInfo;

export class AppController {
    private static _instance: AppController = null;
    public static getInstance() : AppController{
        if (AppController._instance === null) AppController._instance = new AppController();
        return AppController._instance;
    }
    //TODO associate the windows somehow chekck how to do
    public desktopWindow: OWWindow = new OWWindow("desktop");
    public inGameWindow: OWWindow = new OWWindow("in-game");
    private gameListener: OWGameListener
    private constructor() {
        this.gameListener = new OWGameListener({
            onGameStarted(info: RunningGameInfo): any {
                //TODO check if it's needed to check if it's a supported game
                const cont = AppController.getInstance()
                cont.desktopWindow.close();
                cont.inGameWindow.restore();
            },
            onGameEnded(info: RunningGameInfo): any {
                const cont = AppController.getInstance()
                cont.desktopWindow.restore() //TODO do communication
                cont.inGameWindow.close()
            }
        })
        overwolf.extensions.onAppLaunchTriggered.addListener(e => {
            //This means that the app was lanuched by the game starting
            //We want this template to be on launch app on click
            if (!e || e.origin.includes("gamelaunchevent")) return;
            OWGames.getRunningGameInfo().then(gameRunning => {
                //this way in game the desktop will never open, leave if intentional
                if (gameRunning.isRunning && gameRunning.id in manifest.data.game_targeting.game_ids){
                    //in-game launch
                    this.inGameWindow.restore();
                    this.desktopWindow.close();
                } else {
                    //normal lanuch
                    this.inGameWindow.close();
                    this.desktopWindow.restore();
                }
            })

        })
    }


}
