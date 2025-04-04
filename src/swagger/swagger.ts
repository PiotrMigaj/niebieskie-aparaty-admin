import swaggerJSDoc from 'swagger-jsdoc';

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
        url: process.env.NODE_ENV === 'production' 
          ? 'https://admin.niebieskie-aparaty.pl' 
          : `https://admin.niebieskie-aparaty.pl`,
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
    './src/packages/user/userRoutes.ts',
    './src/packages/event/eventRoutes.ts',
    './src/packages/file/fileRoutes.ts',
    './src/packages/auth/authRoutes.ts',
  ],
};

console.log(JSON.stringify(swaggerOptions));
// Initialize swagger-jsdoc
const swaggerDocs = swaggerJSDoc(swaggerOptions);

export default swaggerDocs;
