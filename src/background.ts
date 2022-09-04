//TODO finish + do TODOs
import {OWGameListener, OWWindow} from "@overwolf/overwolf-api-ts/dist";
type RunningGameInfo = overwolf.games.RunningGameInfo;

type OnGameStateChangeDel = {
    GameStateChange: "start" | "end",
    del:{(info: RunningGameInfo):any}
};
type Id = number;
type GameStateChange = "start" | "end";
class BackgroundController {
    private static _instance: BackgroundController = null;
    private windows: Record<string, OWWindow>;
    private _currIdNum: Id = 0;
    private onGameStageChangeFuns: Record<number,OnGameStateChangeDel> = new Array(0)
    public RegisterOnGameState(del: OnGameStateChangeDel): Id{
        //TODO add to the records with a new id and return the id
    }
    public UnregisterOnGameStateChange(id: Id): boolean{
        //True if it found delegate of that id
        //TODO remove id from record
    }
    public static getInstance() : BackgroundController{
        if (BackgroundController._instance === null) BackgroundController._instance = new BackgroundController();
        return BackgroundController._instance;
    }
    private _gameListener: OWGameListener
    private constructor() {
        this._gameListener = new OWGameListener({
            onGameStarted(info: RunningGameInfo): any {
                //TODO make a foreach on the delegates
            },
            onGameEnded(info: RunningGameInfo): any {
                //TODO make a foreach on the delegates
            }
        })
    }
}
