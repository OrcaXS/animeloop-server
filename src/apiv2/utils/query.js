const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;
const Response = require('./response.js');
const Database = require('../../core/database.js');


class Query {
  static loop(req, callback) {
    const cdn = req.query.cdn;
    const episodeId = req.query.episodeid;
    const seriesId = req.query.seriesid;
    const collectionId = req.query.collectionid;
    const duration = req.query.duration;
    const sourceFrom = req.query.source_from;
    const full = req.query.full;
    const page = req.query.page;
    const limit = req.query.limit;

    const query = {};
    const opts = {};

    Query.paramBoolString(cdn, 'cdn', opts);

    if (!Query.paramObjectId(seriesId, 'series', query)) {
      callback(Response.returnError(400, 'query parameter [seriesid] was not correct, please provide a 24 length MongoDB ObjectId string.'));
      return;
    }
    if (!Query.paramObjectId(episodeId, 'episode', query)) {
      callback(Response.returnError(400, 'query parameter [episodeid] was not correct, please provide a 24 length MongoDB ObjectId string.'));
      return;
    }

    if (!Query.paramFloatRange(duration, 'duration', query)) {
      callback(Response.returnError(400, 'please provide correct [duration] query param.'));
      return;
    }

    Query.paramExist(sourceFrom, 'sourceFrom', query);

    Query.paramBoolString(full, 'full', opts);
    if (!Query.paramInt(limit, 'limit', opts)) {
      callback(Response.returnError(400, 'query parameter [limit] parse failed, please provide an integer number.'));
      return;
    }
    if (!Query.paramInt(page, 'page', opts)) {
      callback(Response.returnError(400, 'query parameter [page] parse failed, please provide an integer number.'));
      return;
    }


    Query.paramCollectionId(collectionId, '_id', query, (err) => {
      if (err) {
        callback(Response.returnError(400, 'query parameter [collectionid] was not correct, please provide a integer number.'));
        return;
      }

      callback(null, {
        query,
        opts,
      });
    });
  }

  static episode(req, callback) {
    const cdn = req.query.cdn;
    const seriesId = req.query.seriesid;
    const no = req.query.no;
    const full = req.query.full;
    const page = req.query.page;
    const limit = req.query.limit;

    const query = {};
    const opts = {};

    Query.paramBoolString(cdn, 'cdn', opts);

    if (!Query.paramObjectId(seriesId, 'series', query)) {
      callback(Response.returnError(400, 'query parameter [seriesid] was not correct, please provide a 24 length MongoDB ObjectId string.'));
      return;
    }
    Query.paramExist(no, 'no', query);
    Query.paramBoolString(full, 'full', opts);
    if (!Query.paramInt(limit, 'limit', opts)) {
      callback(Response.returnError(400, 'query parameter [limit] parse failed, please provide an integer number.'));
      return;
    }
    if (!Query.paramInt(page, 'page', opts)) {
      callback(Response.returnError(400, 'query parameter [page] parse failed, please provide an integer number.'));
      return;
    }

    callback(null, {
      query,
      opts,
    });
  }

  static series(req, callback) {
    const cdn = req.query.cdn;
    const type = req.query.type;
    const season = req.query.season;
    const page = req.query.page;
    const limit = req.query.limit;

    const query = {};
    const opts = {};

    Query.paramBoolString(cdn, 'cdn', opts);


    Query.paramExist(type, 'type', query);
    if (!Query.paramSeriesSeason(season, 'start_date_fuzzy', query)) {
      callback(Response.returnError(400, 'query parameter [season] parse failed, please provide an YYYY-M date string.'));
      return;
    }
    if (!Query.paramInt(limit, 'limit', opts)) {
      callback(Response.returnError(400, 'query parameter [limit] parse failed, please provide an integer number.'));
      return;
    }
    if (!Query.paramInt(page, 'page', opts)) {
      callback(Response.returnError(400, 'query parameter [page] parse failed, please provide an integer number.'));
      return;
    }

    callback(null, {
      query,
      opts,
    });
  }

  static tag(req, callback) {
    const cdn = req.query.cdn;
    const loopId = req.query.loopid;
    const type = req.query.type;
    const source = req.query.source;
    const confidence = req.query.confidence;
    const page = req.query.page;
    const limit = req.query.limit;

    const query = {};
    const opts = {};

    Query.paramBoolString(cdn, 'cdn', opts);

    if (!Query.paramObjectId(loopId, 'loopid', opts)) {
      callback(Response.returnError(400, 'query parameter [loopid] was not correct, please provide a 24 length MongoDB ObjectId string.'));
      return;
    }
    Query.paramExist(type, 'type', query);
    Query.paramExist(source, 'source', query);
    if (!Query.paramFloatRange(confidence, 'confidence', query)) {
      callback(Response.returnError(400, 'query parameter [confidence] parse failed, please provide two float numbers split by \',\'.'));
      return;
    }
    if (!Query.paramInt(page, 'page', opts)) {
      callback(Response.returnError(400, 'query parameter [page] parse failed, please provide an integer number.'));
      return;
    }
    if (!Query.paramInt(limit, 'limit', opts)) {
      callback(Response.returnError(400, 'query parameter [limit] parse failed, please provide an integer number.'));
      return;
    }

    callback(null, {
      query,
      opts,
    });
  }

  static paramSeriesSeason(season, key, query) {
    if (season) {
      season = season.split('-');
      if (season.length !== 2) {
        return false;
      }

      const year = parseInt(season[0], 10);
      const month = parseInt(season[1], 10);

      if (isNaN(year) || isNaN(month)) {
        return false;
      }

      const dateFuzzyGt = (year * 10000) + (month * 100);
      const dateFuzzyLt = dateFuzzyGt + 99;

      query[key] = {
        $gt: dateFuzzyGt,
        $lt: dateFuzzyLt,
      };
      return true;
    }
    return true;
  }
  static paramBoolString(str, key, opts) {
    if (str) {
      opts[key] = (str === 'true');
    }
    return true;
  }
  static paramObjectId(id, key, query) {
    if (id) {
      if (id.length !== 24) {
        return false;
      }
      query[key] = ObjectId(id);
    }
    return true;
  }
  static paramExist(value, key, query) {
    if (value) {
      query[key] = value;
    }
    return true;
  }
  static paramInt(number, key, opts) {
    if (number) {
      number = parseInt(number, 10);
      if (isNaN(number)) {
        return false;
      }
      opts[key] = number;
    }
    return true;
  }
  static paramFloatRange(str, key, query) {
    if (str) {
      let range = str.split(',');
      range = range.map(d => parseFloat(d)).filter(d => !isNaN(d));
      if (range.length !== 2 || range[0] > range[1]) {
        return false;
      }
      query[key] = {
        $gt: range[0],
        $lt: range[1],
      };
    }
    return true;
  }

  static paramCollectionId(id, key, query, callback) {
    if (id) {
      id = parseInt(id, 10);
      if (isNaN(id)) {
        callback('err');
        return;
      }

      Database.CollectionLoopModel.find({ collectionid: id }, (err, docs) => {
        if (err) {
          callback(err);
          return;
        }

        query[key] = {
          $in: docs.map(id => id.loopid),
        };
        callback(null);
      });
      return;
    }
    callback(null);
  }
}

module.exports = Query;
