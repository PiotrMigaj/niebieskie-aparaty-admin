import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session'; // Import express-session correctly
import { SessionOptions } from 'express-session';
import swaggerUi from 'swagger-ui-express';
import flash from 'connect-flash';

// Import routes
import adminAuthRoutes from './packages/admin/adminAuthRoutes';
import userRoutes from './packages/user/userRoutes';
import eventRoutes from './packages/event/eventRoutes';
import fileRoutes from './packages/file/fileRoutes';
import authRoutes from './packages/auth/authRoutes';

// Import middleware
import { errorHandler } from './middleware/errorMiddleware';
import ensureAdminSession from './middleware/adminAuthMiddleware';

// Import swagger docs
import swaggerDocs from './swagger/swagger';

// Import passport configuration
import './config/passport';

// Import DB connection
import { connectDB } from './config/db';
import logger from './utils/logger';
import path from 'path';

// Create Express app
const app: Express = express();

// Set up EJS as the templating engine
app.set('view engine', 'ejs'); // Use EJS to render views
// Ensure you use the correct path to your views directory
const viewsPath =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../dist/views') // For production, views should be in dist/views
    : path.join(__dirname, 'views'); // In dev, they should be in the 'views' folder in src

logger.info('viewPath: ' + viewsPath);

app.set('views', viewsPath); // Set the views directory

// Session Configuration
const sessionOptions: SessionOptions = {
  secret: process.env.SESSION_SECRET || 'your_session_secret', // Secret for signing the session ID cookie
  resave: false, // Don't force the session to be saved back to the store if it wasn't modified
  saveUninitialized: false, // Don't save uninitialized sessions
  cookie: {
    secure: false, // Set to true in production if using https
    httpOnly: true, // Helps mitigate XSS attacks by preventing client-side JS from accessing the session cookie
    maxAge: 1000 * 60 * 60 * 24, // Cookie expiration time (1 day)
  },
};

// Use session middleware
app.use(session(sessionOptions));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(flash());

// Redirect from / to /api-docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// API Routes
app.use('', adminAuthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);

// Swagger Documentation
app.use('/api-docs', ensureAdminSession, swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handling middleware
app.use(errorHandler);

// Connect to DynamoDB before exporting the app
connectDB()
  .then(() => {
    logger.info('DynamoDB connection is ready.');
  })
  .catch((error) => {
    logger.error(`DynamoDB connection failed: ${error}`);
    process.exit(1); // Exit the process if DB connection fails
  });

export default app;
