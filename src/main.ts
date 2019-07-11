import { WebApp } from "./webapp";
import { Settings } from "./settings";
import * as SimpleNodeLogger from 'simple-node-logger';
import { Helper } from "./helper";

export class Main {

    private settings: Settings;
    private static logger;
    private app: WebApp;

    constructor() {
        this.settings = new Settings('./data/settings.json');
        this.createLogger();
        this.app = new WebApp(this.settings);

        this.app.listen(() => {
            Main.getLogger().info('Express server running under port ' + this.settings.port);
        });
    }

    private createLogger(): void {
        Helper.createFolderSync(this.settings.logFolder);
        // Creating a logger like this creates a rolling file logger specified like this, because of we omit the options a console appender will be added we cant configure
        const logManager = SimpleNodeLogger.createLogManager({
            errorEventName: 'error',
            logDirectory: this.settings.logFolder,
            fileNamePattern: '<DATE>.log',
            dateFormat: 'YYYY-MM-DD',
            timestampFormat: 'HH:mm:ss.SSS',
            level: 'trace'
        });
        logManager.createConsoleAppender({
            timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
            level: 'info'
        });
        Main.logger = logManager.createLogger('[Primary Logger]');
    }

    public static getLogger() {
        return Main.logger;
    }
}

new Main();