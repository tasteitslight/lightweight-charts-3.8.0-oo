import { ensureNotNull } from '../helpers/assertions';
;
function distanceBetweenPoints(pos1, pos2) {
    return pos1._internal_position - pos2._internal_position;
}
function speedPxPerMSec(pos1, pos2, maxSpeed) {
    var speed = (pos1._internal_position - pos2._internal_position) / (pos1._internal_time - pos2._internal_time);
    return Math.sign(speed) * Math.min(Math.abs(speed), maxSpeed);
}
function durationMSec(speed, dumpingCoeff) {
    var lnDumpingCoeff = Math.log(dumpingCoeff);
    return Math.log((1 /* EpsilonDistance */ * lnDumpingCoeff) / -speed) / (lnDumpingCoeff);
}
var KineticAnimation = /** @class */ (function () {
    function KineticAnimation(minSpeed, maxSpeed, dumpingCoeff, minMove) {
        this._private__position1 = null;
        this._private__position2 = null;
        this._private__position3 = null;
        this._private__position4 = null;
        this._private__animationStartPosition = null;
        this._private__durationMsecs = 0;
        this._private__speedPxPerMsec = 0;
        this._private__terminated = false;
        this._private__minSpeed = minSpeed;
        this._private__maxSpeed = maxSpeed;
        this._private__dumpingCoeff = dumpingCoeff;
        this._private__minMove = minMove;
    }
    KineticAnimation.prototype._internal_addPosition = function (position, time) {
        if (this._private__position1 !== null) {
            if (this._private__position1._internal_time === time) {
                this._private__position1._internal_position = position;
                return;
            }
            if (Math.abs(this._private__position1._internal_position - position) < this._private__minMove) {
                return;
            }
        }
        this._private__position4 = this._private__position3;
        this._private__position3 = this._private__position2;
        this._private__position2 = this._private__position1;
        this._private__position1 = { _internal_time: time, _internal_position: position };
    };
    KineticAnimation.prototype._internal_start = function (position, time) {
        if (this._private__position1 === null || this._private__position2 === null) {
            return;
        }
        if (time - this._private__position1._internal_time > 50 /* MaxStartDelay */) {
            return;
        }
        // To calculate all the rest parameters we should calculate the speed af first
        var totalDistance = 0;
        var speed1 = speedPxPerMSec(this._private__position1, this._private__position2, this._private__maxSpeed);
        var distance1 = distanceBetweenPoints(this._private__position1, this._private__position2);
        // We're calculating weighted average speed
        // Than more distance for a segment, than more its weight
        var speedItems = [speed1];
        var distanceItems = [distance1];
        totalDistance += distance1;
        if (this._private__position3 !== null) {
            var speed2 = speedPxPerMSec(this._private__position2, this._private__position3, this._private__maxSpeed);
            // stop at this moment if direction of the segment is opposite
            if (Math.sign(speed2) === Math.sign(speed1)) {
                var distance2 = distanceBetweenPoints(this._private__position2, this._private__position3);
                speedItems.push(speed2);
                distanceItems.push(distance2);
                totalDistance += distance2;
                if (this._private__position4 !== null) {
                    var speed3 = speedPxPerMSec(this._private__position3, this._private__position4, this._private__maxSpeed);
                    if (Math.sign(speed3) === Math.sign(speed1)) {
                        var distance3 = distanceBetweenPoints(this._private__position3, this._private__position4);
                        speedItems.push(speed3);
                        distanceItems.push(distance3);
                        totalDistance += distance3;
                    }
                }
            }
        }
        var resultSpeed = 0;
        for (var i = 0; i < speedItems.length; ++i) {
            resultSpeed += distanceItems[i] / totalDistance * speedItems[i];
        }
        if (Math.abs(resultSpeed) < this._private__minSpeed) {
            return;
        }
        this._private__animationStartPosition = { _internal_position: position, _internal_time: time };
        this._private__speedPxPerMsec = resultSpeed;
        this._private__durationMsecs = durationMSec(Math.abs(resultSpeed), this._private__dumpingCoeff);
    };
    KineticAnimation.prototype._internal_getPosition = function (time) {
        var startPosition = ensureNotNull(this._private__animationStartPosition);
        var durationMsecs = time - startPosition._internal_time;
        return startPosition._internal_position + this._private__speedPxPerMsec * (Math.pow(this._private__dumpingCoeff, durationMsecs) - 1) / (Math.log(this._private__dumpingCoeff));
    };
    KineticAnimation.prototype._internal_finished = function (time) {
        return this._private__animationStartPosition === null || this._private__progressDuration(time) === this._private__durationMsecs;
    };
    KineticAnimation.prototype._internal_terminated = function () {
        return this._private__terminated;
    };
    KineticAnimation.prototype._internal_terminate = function () {
        this._private__terminated = true;
    };
    KineticAnimation.prototype._private__progressDuration = function (time) {
        var startPosition = ensureNotNull(this._private__animationStartPosition);
        var progress = time - startPosition._internal_time;
        return Math.min(progress, this._private__durationMsecs);
    };
    return KineticAnimation;
}());
export { KineticAnimation };
