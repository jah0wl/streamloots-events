"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_request_1 = require("web-request");
const StreamlootsCard_1 = require("./StreamlootsCard");
exports.StreamlootsCard = StreamlootsCard_1.StreamlootsCard;
const StreamlootsGift_1 = require("./StreamlootsGift");
exports.StreamlootsGift = StreamlootsGift_1.StreamlootsGift;
const StreamlootsPurchase_1 = require("./StreamlootsPurchase");
exports.StreamlootsPurchase = StreamlootsPurchase_1.StreamlootsPurchase;
const StreamlootsEvents_1 = require("./StreamlootsEvents");
exports.StreamlootsEvents = StreamlootsEvents_1.StreamlootsEvents;
function listen(streamlootsId, options, content) {
    let instance = web_request_1.stream(`https://widgets.streamloots.com/alerts/${streamlootsId}/media-stream`, options, content);
    instance.response = new Promise((resolve, reject) => {
        instance
            .on('data', chunk => {
            try {
                if (chunk.length > 2) {
                    const jsonStr = chunk.toString().substring(chunk.toString().indexOf('{') - 1);
                    let streamlootsEvent = JSON.parse(jsonStr);
                    switch (streamlootsEvent.data.type) {
                        case StreamlootsEvents_1.StreamlootsEvents.Redemption:
                            instance.emit(StreamlootsEvents_1.StreamlootsEvents.Redemption, new StreamlootsCard_1.StreamlootsCard(streamlootsEvent));
                            break;
                        case StreamlootsEvents_1.StreamlootsEvents.Purchase:
                            if (streamlootsEvent.data.fields[0].name === StreamlootsEvents_1.StreamlootsEvents.Gift) {
                                instance.emit(StreamlootsEvents_1.StreamlootsEvents.Gift, new StreamlootsGift_1.StreamlootsGift(streamlootsEvent));
                            }
                            else {
                                instance.emit(StreamlootsEvents_1.StreamlootsEvents.Purchase, new StreamlootsPurchase_1.StreamlootsPurchase(streamlootsEvent));
                            }
                            break;
                    }
                }
                resolve();
            }
            catch (err) {
                reject(new web_request_1.RequestError(err, instance));
            }
        })
            .on('error', err => reject(new web_request_1.RequestError(err, instance)));
    });
    return instance;
}
exports.listen = listen;
