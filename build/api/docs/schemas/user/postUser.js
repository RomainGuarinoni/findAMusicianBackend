"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema = {
    post: {
        operationId: 'getUser',
        tags: ['user'],
        security: [
            {
                bearerAuth: ['user'],
            },
        ],
        parameters: [
            {
                name: 'test',
                in: 'path',
                required: true,
                schema: {
                    type: 'number',
                    example: 2,
                },
            },
            {
                name: 'other',
                in: 'path',
                required: true,
                schema: {
                    type: 'number',
                    example: 2,
                },
            },
        ],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                            id: { type: 'string' },
                        },
                    },
                    example: {
                        id: 'an id',
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'good',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['id'],
                            properties: {
                                id: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
    },
};
exports.default = schema;
