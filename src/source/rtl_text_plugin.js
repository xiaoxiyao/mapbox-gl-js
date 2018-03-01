// @flow

const {Event, Evented} = require('../util/evented');

let pluginRequested = false;
let pluginURL = null;
let foregroundLoadComplete = false;

module.exports.evented = new Evented();

type CompletionCallback = (error?: Error) => void;
type ErrorCallback = (error: Error) => void;

module.exports.registerForPluginAvailability = function(
    callback: (args: {pluginURL: string, completionCallback: CompletionCallback}) => void
) {
    if (pluginURL) {
        callback({ pluginURL: pluginURL, completionCallback: module.exports.completionCallback});
    } else {
        module.exports.evented.once('pluginAvailable', callback);
    }
    return callback;
};

module.exports.clearRTLTextPlugin = function() {
    pluginRequested = false;
    pluginURL = null;
};

module.exports.setRTLTextPlugin = function(url: string, callback: ErrorCallback) {
    if (pluginRequested) {
        throw new Error('setRTLTextPlugin cannot be called multiple times.');
    }
    pluginRequested = true;
    pluginURL = url;
    module.exports.completionCallback = (error?: Error) => {
        if (error) {
            // Clear loaded state to allow retries
            module.exports.clearRTLTextPlugin();
            if (callback) {
                callback(error);
            }
        } else {
            // Called once for each worker
            foregroundLoadComplete = true;
        }
    };
    module.exports.evented.fire(new Event('pluginAvailable', { pluginURL: pluginURL, completionCallback: module.exports.completionCallback }));
};

module.exports.applyArabicShaping = (null: ?Function);
module.exports.processBidirectionalText = (null: ?(string, Array<number>) => Array<string>);

module.exports.isLoaded = function() {
    return foregroundLoadComplete ||               // Foreground: loaded if the completion callback returned successfully
        module.exports.applyArabicShaping != null; // Background: loaded if the plugin functions have been compiled
};
