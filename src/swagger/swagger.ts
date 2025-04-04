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
        name: 'API Support'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Niebieskie Aparaty Admin API'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Path to the API docs
  apis: [
    './src/packages/user/userRoutes.ts',
    './src/packages/event/eventRoutes.ts',
    './src/packages/file/fileRoutes.ts',
    './src/packages/auth/authRoutes.ts'
  ]
};

// Initialize swagger-jsdoc
const swaggerDocs = swaggerJSDoc(swaggerOptions);

export default swaggerDocs;