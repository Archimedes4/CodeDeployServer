//server.js
import http from "http";
import { spawn, exec, ChildProcessWithoutNullStreams, execSync, spawnSync, ChildProcess } from 'child_process';

let currentProcess: ChildProcess | undefined = undefined;

const HOST = "localhost";
const PORT = 8020;
const PATH = "/Users/andrewmainella/New\\ Desktop/ArchInvestor/ArchServer";

const server = http.createServer(async (req, res) => {
  console.log("Request on server received :  " + req.method + " : " + req.url);

  /**
   * Health check endpoint `/health`
   * 
   * @path {HOST}:{PORT}/health
   * @return status : {200}
   * @return message : text : "If you see this message, your API server is all set , Welcome !"
   */
  if (req.url === "/" && req.method === "GET") {
    // set the status code, and content-type
    if (currentProcess == undefined) {
      currentProcess = exec(`cd ~\ncd ${PATH}\nnode main.js`)
      currentProcess.on('data', output => {
        console.log("Output: ", output.toString())
      })
      currentProcess.on('error', output => {
        console.log("Error: ", output.message)
      })
      console.log("Here")
      res.writeHead(200, { "Content-Type": "application/json" });
      // send the response data as text
      res.end("Server Started");
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      // send the response data as text
      res.end("Server Already Running");
    }
  } 


  /**
   * Health check endpoint `/health`
   * 
   * @path {HOST}:{PORT}/health
   * @return status {200:OK}
   * @return uptime : how long has been server up & running
   * @return timestamp : Time of response from server  
   */
  else if (req.url === "/health" && req.method === "GET") {
    const healthcheck = {
      uptime: process.uptime(),
      message: "OK",
      timestamp: Date.now(),
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(healthcheck));
  } 

  /**
   * Update endpoint `update`
   * 
   * @path {HOST}:{PORT}/update
   * @return status {200:OK}
   */
  else if (req.url === "/update" && req.method === "GET") {
    if (currentProcess == undefined) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end("Server not started");
    } else {
      currentProcess.kill()
      currentProcess = exec(`cd ~\ncd ${PATH}\ngit pull\nnode main.js`)
      currentProcess.on('data', output => {
        console.log("Output: ", output.toString())
      })
      currentProcess.on('error', output => {
        console.log("Error: ", output.message)
      })
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        message: "OK",
      }));
    }
  } 

  /**
   * Closes shell endpoint `stop`
   * 
   * @path {HOST}:{PORT}/stop
   * @return status {200:OK}
   */
  else if (req.url === "/stop" && req.method === "GET") {
    if (currentProcess !== undefined) {
      currentProcess.kill();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        message: "OK",
      }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        message: "OK",
      }));
    }
  }

  /**
   * Endpoint not implemented / invalid endpoint
   * @path {optional} `/`
   * @return {404} - Route is not implemented (Page Not Found)
   */
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: "Route is not implemented" })
    );
  }
});

server.listen(PORT, () => {
  console.log(`server started on : ${HOST}  port: ${PORT}`);
});