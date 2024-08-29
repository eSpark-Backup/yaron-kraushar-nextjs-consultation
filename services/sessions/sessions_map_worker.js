const { parentPort, threadId } = require("worker_threads");

parentPort.on("message", (jimple_session_map) => {

    const timeInSecondsNowMinusOneHour = (Date.now() / 1000 | 0) - 3600000;// time secs - 1 horu

    var deleteQueue = [];
    console.log(jimple_session_map);

    for (session in jimple_session_map) {
        console.log(session);
        //check timestamp is within 1 hour of current time
        if (session.value.timestamp > timeInSecondsNowMinusOneHour) {
            //add session to a queue to be deleted
            deleteQueue.push(session.key);
        }
    }

    parentPort.postMessage(deleteQueue);
});

//This goes in the main threadId
/*
//create a worker thread to clean up expired sessions every 5 minutes
const worker = new Worker("./lib/sessions/sessions_map_worker.js");
worker.on("message", (deleteQueue) => {
    console.log("Message from worker: " + deleteQueue);
}); 
worker.on("error", (error) => { 
    console.log("Error from worker: " + error);
});
worker.on("exit", (code) => {
    if (code !== 0)
        console.log(`Worker stopped with exit code ${code}`);
});*/