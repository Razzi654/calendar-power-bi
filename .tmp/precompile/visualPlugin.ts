import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var calendarF85018C159D74A3C9EF13F9AF605335D: IVisualPlugin = {
    name: 'calendarF85018C159D74A3C9EF13F9AF605335D',
    displayName: 'Calendar',
    class: 'Visual',
    apiVersion: '2.6.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        throw 'Visual instance not found';
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["calendarF85018C159D74A3C9EF13F9AF605335D"] = calendarF85018C159D74A3C9EF13F9AF605335D;
}

export default calendarF85018C159D74A3C9EF13F9AF605335D;