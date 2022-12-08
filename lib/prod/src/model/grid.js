import { GridPaneView } from '../views/pane/grid-pane-view';
var Grid = /** @class */ (function () {
    function Grid(pane) {
        this._private__paneView = new GridPaneView(pane);
    }
    Grid.prototype._internal_paneView = function () {
        return this._private__paneView;
    };
    return Grid;
}());
export { Grid };
