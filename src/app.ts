import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';

// Import routes
import userRoutes from './packages/user/userRoutes';
import eventRoutes from './packages/event/eventRoutes';
import fileRoutes from './packages/file/fileRoutes';
import authRoutes from './packages/auth/authRoutes'

// Import middleware
import { errorHandler } from './middleware/errorMiddleware';

// Import swagger docs
import swaggerDocs from './swagger/swagger';

// Import passport configuration
import './config/passport';

// Import DB connection
import { connectDB } from "./config/db";
import logger from "./utils/logger";

// Create Express app
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Initialize Passport
app.use(passport.initialize());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/auth',authRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handling middleware
app.use(errorHandler);

// Connect to DynamoDB before exporting the app
connectDB()
  .then(() => {
    logger.info("DynamoDB connection is ready.");
  })
  .catch((error) => {
    logger.error(`DynamoDB connection failed: ${error}`);
    process.exit(1); // Exit the process if DB connection fails
  });

export default app;