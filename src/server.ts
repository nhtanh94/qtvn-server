import express from 'express';

const port = process.env.PORT || 5000;

const app = express();

app.get('/', (req: express.Request, res: express.Response)=>{res.send('API running...');});

app.listen(port, () => {console.log('Express server port: ' + port)})