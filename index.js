// Generated by CoffeeScript 1.7.1
(function() {
    var app, black, config, express, fs, http, ipblack, less, lessmiddle, log4js, logger, path, rainbow, _;

    express = require("express");

    http = require("http");

    path = require("path");

    config = require('./config.coffee');

    rainbow = require('./lib/rainbow.js');

    lessmiddle = require('less-middleware');

    less = require('less');

    fs = require('fs');

    global.xss = require('xss');

    xss.whiteList['iframe'] = ['src', 'width', 'height', 'allowfullscreen', 'frameborder', 'id', 'class', 'style'];

    _ = require('underscore');

    module.exports = app = express();

    log4js = require('log4js');

    log4js.configure({
        appenders: [{
            type: 'console'
        }]
    });

    logger = log4js.getLogger('normal');

    logger.setLevel('INFO');

    black = ['webmeup', 'DNSPod', 'monitor', 'snarfware', 'majestic12', 'easou', 'yunyun', 'sougou', 'sogou', 'yunrang', 'ahrefs', "longurl", 'rogerbot','YisouSpider'];

    ipblack = ['211.144.76.89'];
    app.configure(function() {
        var static_jades;
        app.set("port", config.run_port);
        app.set("views", path.join(__dirname, 'views'));
        app.set("view engine", "jade");
        app.use(express.favicon());
        app.use("/assets", lessmiddle({
            src: __dirname + "/assets",
            compress: true
        }));
        app.use("/resumes", express["static"](__dirname + "/resumes"));
        app.use("/assets", express["static"](__dirname + "/assets"));
        app.use("/uploads", express["static"](__dirname + "/uploads"));
        app.use("/static", express["static"](__dirname + "/static"));
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.cookieSession({
            secret: config.session_secret
        }));
        app.use(log4js.connectLogger(logger, {
            level: log4js.levels.INFO
        }));
        app.use(function(req, res, next) {
            var agent, i, _i, _ref;
            res.locals.url = req.url;
            agent = req.get("user-agent");
            if (!agent) {
                res.end(' hello robot 1');
                return;
            }
            for (i = _i = 0, _ref = black.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                if (agent.indexOf(black[i]) !== -1) {
                    res.end(' hello robot 2');
                    return;
                }
            }
            return next();
        });
        app.use(function(req, res, next) {
            var i, ip, _i, _ref;
            ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            for (i = _i = 0, _ref = ipblack.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                if (ip.indexOf(ipblack[i]) !== -1) {
                    res.end(' 404');
                    return;
                }
            }
            return next();
        });
        app.use(app.router);
        rainbow.route(app, {
            controllers: '/controllers/',
            filters: '/filters/',
            template: '/views/'
        });
        static_jades = {};
        app.get("/:p", function(req, res, next) {
            var p;
            p = req.params.p;
            if (static_jades[p]) {
                res.render(p + ".jade");
                return;
            } else {
                if (fs.existsSync(path.join(__dirname, 'views', p + ".jade"))) {
                    res.render(p + ".jade");
                    static_jades[p] = true;
                    return;
                }
            }
            return next();
        });
        app.all("*", function(req, res, next) {
            return res.render('404.jade', {
                status: 404
            }, function(error, page) {
                return res.send(page, 404);
            });
        });
        app.use(function(err, req, res, next) {
            console.trace(err);
            return res.render('error.jade', {
                error: err.message,
                code: err.code
            }, function(error, page) {
                return res.send(page, 404);
            });
        });
        app.locals.moment = require('moment');
        app.locals.moment.lang('zh-cn');
        app.locals.pretty = true;
        app.locals.stringUtil = require('./lib/string-util.coffee');
        app.locals.arrayUtil = require('./lib/array-util.coffee');
        app.locals.assets_head = config.assets_head;
        return app.locals.assets_tm = "8-23";
    });

    app.configure("development", function() {
        return app.use(express.errorHandler());
    });

}).call(this);