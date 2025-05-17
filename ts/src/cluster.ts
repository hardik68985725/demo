import path from "node:path";
import { availableParallelism } from "node:os";
import cluster from "node:cluster";

const worker_file_path = path
  .join(__dirname, "core", "worker.js")
  .replace(new RegExp("\\\\", "g"), "/");

cluster.setupPrimary({ exec: worker_file_path });

const number_of_cpus = availableParallelism();
for (let i = 0; i < number_of_cpus; i++) {
  cluster.fork();
}

cluster.on("exit", (worker) => {
  console.log(
    `APP_LOG_POINT - WORKER PROCESS [${worker.process.pid}] HAS BEEN KILLED.`
  );
  cluster.fork();
});
