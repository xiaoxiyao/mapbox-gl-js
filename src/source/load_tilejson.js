// @flow

import util from '../util/util';

import ajax from '../util/ajax';
import browser from '../util/browser';
import { normalizeSourceURL as normalizeURL } from '../util/mapbox';

import type {RequestTransformFunction} from '../ui/map';
import type {Callback} from '../types/callback';
import type {TileJSON} from '../types/tilejson';

export default function(options: any, requestTransformFn: RequestTransformFunction, callback: Callback<TileJSON>) {
    const loaded = function(err, tileJSON: any) {
        if (err) {
            return callback(err);
        } else if (tileJSON) {
            const result: any = util.pick(tileJSON, ['tiles', 'minzoom', 'maxzoom', 'attribution', 'mapbox_logo', 'bounds']);

            if (tileJSON.vector_layers) {
                result.vectorLayers = tileJSON.vector_layers;
                result.vectorLayerIds = result.vectorLayers.map((layer) => { return layer.id; });
            }

            callback(null, result);
        }
    };

    if (options.url) {
        ajax.getJSON(requestTransformFn(normalizeURL(options.url), ajax.ResourceType.Source), loaded);
    } else {
        browser.frame(() => loaded(null, options));
    }
};
