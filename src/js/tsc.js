var ChronoState;
(function (ChronoState) {
    ChronoState[ChronoState["Stopped"] = 0] = "Stopped";
    ChronoState[ChronoState["Running"] = 1] = "Running";
})(ChronoState || (ChronoState = {}));
var ChronoType;
(function (ChronoType) {
    ChronoType[ChronoType["Timer"] = 1] = "Timer";
    ChronoType[ChronoType["Inspection"] = 2] = "Inspection";
})(ChronoType || (ChronoType = {}));
var Chrono = (function () {
    function Chrono(type) {
        if (type === void 0) { type = ChronoType.Timer; }
        this.type = type;
        this.state = ChronoState.Stopped;
        this.dec = this.sec = this.min = 0;
    }
    Chrono.prototype.loop = function () {
        this.endTime = new Date();
        this.diff = this.endTime - this.startTime;
        this.diff = new Date(this.diff);
        this.dec = this.diff.getMilliseconds();
        this.sec = this.diff.getSeconds();
        this.min = this.diff.getMinutes();
        this.continue();
    };
    Chrono.prototype.start = function () {
        if (this.state == ChronoState.Stopped) {
            this.state = ChronoState.Running;
            this.startTime = new Date();
            this.loop();
        }
    };
    Chrono.prototype.stop = function () {
        if (this.state == ChronoState.Running) {
            this.state = ChronoState.Stopped;
            clearTimeout(this.timerId);
        }
    };
    Chrono.prototype.reset = function () {
        this.startTime = new Date();
    };
    Chrono.prototype.continue = function () {
        var _this = this;
        if (this.type == ChronoType.Inspection && this.sec > 14) {
            clearTimeout(this.timerId);
        }
        else {
            this.timerId = setTimeout(function () { return _this.loop(); }, 100);
        }
        this.helper.show(this.sec.toString());
    };
    Chrono.prototype.dump = function () {
        console.log('#Chrono');
        console.log('@Type: ' + this.type);
    };
    return Chrono;
}());
var Session = (function () {
    function Session(name) {
        if (name === void 0) { name = 'Default'; }
        this.name = name;
        this.solves = new Array();
    }
    Session.prototype.addSolve = function (newSolve) {
        this.solves.push(newSolve);
    };
    Session.prototype.deleteSolve = function (index) {
        if (this.getNumberOfSolves() <= index) {
            this.solves.splice(index);
        }
    };
    Session.prototype.getNumberOfSolves = function () {
        if (this.solves == null)
            return 0;
        else
            return this.solves.length;
    };
    Session.prototype.dump = function () {
        console.log('#Session');
        console.log('@Name: ' + this.name + ' @Solves: ' + this.solves);
    };
    return Session;
}());
var Solve = (function () {
    function Solve() {
    }
    Solve.prototype.setTime = function (time) {
        var re = /^([0-9]{2}):([0-5])([0-9])\.([0-9]{2})$/;
        if (!time.match(re)) {
            console.log('String ' + time + ' doesn\'t seem like a correct time');
            return;
        }
        this.min = parseInt(time.substr(0, 2));
        this.sec = parseInt(time.substr(3, 5));
        this.dec = parseInt(time.substr(6, 8));
    };
    Solve.prototype.getTime = function () {
        var str = this.min + ':' + this.sec + '.' + this.dec;
        return str;
    };
    Solve.prototype.dump = function () {
        console.log('#Solve');
        console.log('@Time: ' + this.getTime() + ' @Scramble: ' + this.scramble);
    };
    return Solve;
}());
var Settings = (function () {
    function Settings(inspection, hideTime, theme) {
        if (inspection === void 0) { inspection = false; }
        if (hideTime === void 0) { hideTime = false; }
        if (theme === void 0) { theme = 'bright'; }
        this.inspection = inspection;
        this.hideTime = hideTime;
        this.theme = theme;
    }
    Settings.prototype.toggleInspection = function () {
        this.inspection = !this.inspection;
    };
    Settings.prototype.toggleHideTime = function () {
        this.hideTime = !this.hideTime;
    };
    Settings.prototype.toggleTheme = function () {
        if (this.theme == 'bright') {
            this.theme = 'dark';
        }
        else {
            this.theme = 'bright';
        }
    };
    Settings.prototype.dump = function () {
        console.log('#Settings');
        console.log('@Inspection: ' + this.inspection + ' @HideTime: ' + this.hideTime + ' @Theme: ' + this.theme);
    };
    return Settings;
}());
var Model = (function () {
    function Model() {
        this.settings = new Settings();
        this.sessions = new Array();
        this.sessions.push(new Session());
        this.chrono = new Chrono();
    }
    Model.prototype.dump = function () {
        this.chrono.dump();
        this.sessions.forEach(function (element) {
            element.dump();
        });
        this.settings.dump();
    };
    return Model;
}());
var Controller = (function () {
    function Controller() {
        this.model = new Model();
        this.chronoHelper = new ChronoHelper(this.model);
        this.inputHelper = new InputHelper();
    }
    Controller.prototype.startChrono = function () {
        this.chronoHelper.start();
    };
    Controller.prototype.stopChrono = function () {
        this.chronoHelper.stop();
    };
    Controller.prototype.dump = function () {
        this.model.dump();
    };
    return Controller;
}());
var ChronoHelper = (function () {
    function ChronoHelper(model) {
        this.model = model;
        this.model.chrono.helper = this;
    }
    ChronoHelper.prototype.start = function () {
        this.model.chrono.start();
    };
    ChronoHelper.prototype.stop = function () {
        this.model.chrono.stop();
        this.show(this.getTimeString());
    };
    ChronoHelper.prototype.show = function (time) {
        document.getElementById('timer').innerText = time;
    };
    ChronoHelper.prototype.getTimeString = function () {
        var min = (this.model.chrono.min > 10) ? this.model.chrono.min : '0' + this.model.chrono.min;
        var sec = (this.model.chrono.sec > 10) ? this.model.chrono.sec : '0' + this.model.chrono.sec;
        var dec = this.model.chrono.dec;
        return min + ':' + sec + '.' + dec;
    };
    return ChronoHelper;
}());
var InputHelper = (function () {
    function InputHelper() {
        this.bindEventsToBody();
        this.resetKeys();
    }
    InputHelper.prototype.bindEventsToBody = function () {
        document.body.addEventListener("keyup", this.keyUp);
        document.body.addEventListener("keydown", this.keyDown);
    };
    InputHelper.prototype.resetKeys = function () {
        this.keysPressed = {};
    };
    InputHelper.prototype.keyUp = function (event) {
        var key = event.which;
        this.keysPressed[key] = false;
    };
    InputHelper.prototype.keyDown = function (event) {
        var key = event.which;
        this.keysPressed[key] = true;
    };
    return InputHelper;
}());
//# sourceMappingURL=tsc.js.map