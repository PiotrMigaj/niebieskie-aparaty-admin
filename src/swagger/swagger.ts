import swaggerJSDoc from 'swagger-jsdoc';
import logger from '../utils/logger';

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Niebieskie Aparaty Admin API',
      version: '1.0.0',
      description: 'REST API for Niebieskie Aparaty Admin Panel',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        // Dynamically set the URL based on the environment
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://admin.niebieskie-aparaty.pl'
            : `http://localhost:${process.env.PORT || 3000}`,
        description: 'Niebieskie Aparaty Admin API',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Path to the API docs
  apis: [
    './src/apps/user/infrastructure/rest/userRestRoutes.ts',
    './src/apps/event/infrastructure/rest/eventRestRoutes.ts',
    './src/apps/file/fileRoutes.ts',
    './src/apps/auth/authRoutes.ts',
  ],
};

logger.info(JSON.stringify(swaggerOptions));
// Initialize swagger-jsdoc
const swaggerDocs = swaggerJSDoc(swaggerOptions);

export default swaggerDocs;
