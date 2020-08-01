import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
export declare class Visual implements IVisual {
    private target;
    private table;
    private thead;
    private tbody;
    private curDate;
    private curYear;
    private curMonth;
    private curDay;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    private getData;
    private createCalendar;
}
