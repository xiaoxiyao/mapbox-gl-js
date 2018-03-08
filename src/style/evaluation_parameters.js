// @flow

const ZoomHistory = require('./zoom_history');
const {isStringRenderable} = require('../util/script_detection');
const rtlTextPlugin = require('../source/rtl_text_plugin');

class EvaluationParameters {
    zoom: number;
    now: number;
    fadeDuration: number;
    zoomHistory: ZoomHistory;
    transition: TransitionSpecification;

    // address in review: options may also be another EvaluationParameters to copy, see CrossFadedProperty.possiblyEvaluate
    // Is this necessary? If so, should it be explicitly supported?
    constructor(zoom: number, options?: *) {
        this.zoom = zoom;

        if (options) {
            this.now = options.now;
            this.fadeDuration = options.fadeDuration;
            this.zoomHistory = options.zoomHistory;
            this.transition = options.transition;
        } else {
            this.now = 0;
            this.fadeDuration = 0;
            this.zoomHistory = new ZoomHistory();
            this.transition = {};
        }
    }

    isSupportedScript(str: string): boolean {
        return isStringRenderable(str, rtlTextPlugin.isLoaded());
    }

    crossFadingFactor() {
        if (this.fadeDuration === 0) {
            return 1;
        } else {
            return Math.min((this.now - this.zoomHistory.lastIntegerZoomTime) / this.fadeDuration, 1);
        }
    }
}

module.exports = EvaluationParameters;
