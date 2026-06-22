// Shared OpenAPI schema definitions for sveltekit-openapi-generator
export {};

/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Starter API
 *   version: 1.0.0
 *   description: |
 *     Starter template API for serverless applications.
 *   contact:
 *     name: API Support
 *   license:
 *     name: MIT
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: API Key
 *       description: API key authentication
 *   schemas:
 *     DemoResponse:
 *       type: object
 *       required:
 *         - message
 *         - timestamp
 *       properties:
 *         message:
 *           type: string
 *           example: "Hello from Cloudflare Workers D1!"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-06-22T12:00:00Z"
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Unauthorized"
 */
