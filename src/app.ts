import { Logger } from '@core/utils';
import { Route } from '@core/interfaces';
import cors from 'cors';
import { errorMiddleware } from '@core/middleware';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoose from 'mongoose';
import morgan from 'morgan';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
class App {
  public app: express.Application;
  public port: string | number;
  public production: boolean;

  constructor(routes: Route[]) {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.production = process.env.NODE_ENV == 'production' ? true : false;

    this.connectToDatabase();
    this.initializeMiddleware();
    // NOTE : Run this.initializeMiddleware(); behind route
    this.initializeRoutes(routes);
    this.initializeErorMiddleware();
    this.initializSwagger();
  }

  public listen() {
    this.app.listen(this.port, () => {
      Logger.info(`Server is listening on port ${this.port}`);
    });
  }

  private initializeRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use('/', route.router);
    });
  }

  // NOTE : Note Sorting order
  private initializeMiddleware() {
    if (this.production) {
      // NOTE : Valiadate request params spam
      this.app.use(hpp());
      this.app.use(helmet());
      // NOTE : Console log lv with color
      this.app.use(morgan('combined'));
      this.app.use(cors({ origin: 'your.domain.com', credentials: true }));
    } else {
      this.app.use(morgan('dev'));
      this.app.use(cors({ origin: true, credentials: true }));
    }

    // NOTE : Recieve json from body request
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeErorMiddleware(){
    // NOTE : throw error
    this.app.use(errorMiddleware);
  }

  private connectToDatabase() {
    const connectString = process.env.MONGODB_URI;
    if (!connectString) {
      Logger.error('Connection string is invalid');
      return;
    }
    mongoose
      .connect(connectString)
      .catch((reason) => {
        Logger.error(reason);
      });
    Logger.info('Database connected...');
  }

  private initializSwagger(){
    const swaggerDocument = YAML.load('./src/swagger.yaml');
    this.app.use('/swagger',swaggerUi.serve,swaggerUi.setup(swaggerDocument))
  }
}

export default App;
