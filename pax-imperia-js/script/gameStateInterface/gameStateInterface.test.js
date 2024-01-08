import { Galaxy } from "../models/galaxy";
import { GameStateInterface } from "./gameStateInterface";
import * as THREE from 'three';

const websocket = {
    send: () => { },
    onmessage: () => { }
};

const galaxy = new Galaxy();

test("its clock can be started and shared with another client which will have the same elapsed time", done => {
    const gameStateInterface  = new GameStateInterface({ galaxy });
    gameStateInterface.startClock();

    const clock1 = gameStateInterface.gameClock;
    clock1.getElapsedTime();
    const networkOldTime = clock1.oldTime;

    let clock2;
    clock2 = new THREE.Clock(true);
    clock2.getElapsedTime();

    // Make sure clock1 can call getElapsedTime() without throwing off the test
    setTimeout(() => {
        clock1.getElapsedTime();
    }, 50);

    // Wait a second
    setTimeout(() => {
        // clock2.start();

        clock2.startTime = networkOldTime;
        clock2.oldTime = networkOldTime;

        const t1 = clock1.getElapsedTime();
        const t2 = clock2.getElapsedTime();

        // Sometimes this is off by 1ms so it's testing toFixed 3 instead of 4...
        expect(t1.toFixed(3)).toBe(t2.toFixed(3));

        done();
    }, 100);

});
