const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(morgan('dev', {
  skip: function (req, res) {
    if (req.url === '/health' || req.url === '/ready') {
        return true;
    } else {
        return false;
    }
  }
}));


// Environment variable configurations
let port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
let terminationGracePeriod = process.env.TERMINATION_GRACE_PERIOD ? process.env.TERMINATION_GRACE_PERIOD : 30;
const defaultDelay = 30 * 1000; // 30s default delay interval for /long route

// Application state
let healthy = true;
let ready = true; 
let connections = []; // Server connection pool

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

app.get('/', (_, res) => {
  res.send('Welcome to voiceflow k8s demo app!');
});

app.get('/ready', (_, res) => {
  if(ready){
    res.send('ready!');
  } else {
    res.status(500).send('not ready!');
  }
});

app.post('/ready', (req, res) => {
  // Set ready status
  ready = req.body.ready ? true : false;
  res.send(`Readiness status set to: ${ready}`);
})

app.get('/health', (_, res) => {
  if(healthy) {
    res.send('healthy!');
  } else {
    res.status(500).send('not healthy!');
  }
});

app.post('/health', (req, res) => {
  // Set health status
  healthy = req.body.healthy ? true : false;
  res.send(`Healthiness status set to: ${healthy}`);
});

// Dummy application routes
app.post('/short', (_, res) => {
  res.send('short response');
});

app.post('/long', async (req, res) => {
  const longDelay = req.body.delay ? parseInt(req.body.delay) * 1000 : defaultDelay;
  await delay(longDelay);
  res.send('long response');
});

const server = app.listen(port, () => {
  console.log(`Voiceflow k8s demo listening on port: ${port}`)
});

server.on('connection', connection => {
    connections.push(connection);
    connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

const shutdown = () =>  {
  console.log(`Received kill signal, shutting down gracefully. Current connections: ${connections.length}`);

  // await server.close(() => {
  //   console.log('Closed out remaining connections');
  // });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);