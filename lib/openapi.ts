export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Tiri API",
    version: "1.0.0",
    description:
      "Studio-first event platform API for authentication, templates, events, guests, and media workflows.",
  },
  servers: [{ url: "/", description: "Current environment" }],
  tags: [
    { name: "Auth", description: "Studio authentication" },
    { name: "Templates", description: "Invitation template management" },
    { name: "Events", description: "Event CRUD" },
    { name: "Guests", description: "Guest management and check-in" },
    { name: "Media", description: "Event media records" },
  ],
  components: {
    securitySchemes: {
      StudioSessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "studio_session",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          phone: { type: "string" },
          role: { type: "string", enum: ["ADMIN", "STAFF"] },
          studioId: { type: "string", format: "uuid" },
        },
      },
      Studio: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string", nullable: true },
          logoUrl: { type: "string", nullable: true },
          primaryColor: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Template: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          slug: { type: "string" },
          previewImage: { type: "string", nullable: true },
          category: {
            type: "string",
            enum: ["TRADITIONAL", "MODERN", "RELIGIOUS"],
          },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Event: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          studioId: { type: "string", format: "uuid" },
          templateId: { type: "string", format: "uuid" },
          title: { type: "string" },
          brideName: { type: "string", nullable: true },
          groomName: { type: "string", nullable: true },
          bridePhone: { type: "string", nullable: true },
          groomPhone: { type: "string", nullable: true },
          coupleAccessToken: { type: "string" },
          eventDate: { type: "string", format: "date-time" },
          location: { type: "string", nullable: true },
          description: { type: "string", nullable: true },
          coverImage: { type: "string", nullable: true },
          slug: { type: "string" },
          subdomain: { type: "string", nullable: true },
          isPublished: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Guest: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          eventId: { type: "string", format: "uuid" },
          name: { type: "string" },
          phone: { type: "string", nullable: true },
          email: { type: "string", nullable: true },
          invitationCode: { type: "string" },
          checkedIn: { type: "boolean" },
          checkedInAt: { type: "string", nullable: true, format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Media: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          eventId: { type: "string", format: "uuid" },
          type: { type: "string", enum: ["IMAGE", "VIDEO"] },
          url: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["phone", "password"],
        properties: {
          phone: { type: "string" },
          password: { type: "string" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/AuthUser" },
          studio: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
            },
          },
        },
      },
      CreateTemplateRequest: {
        type: "object",
        required: ["name", "slug", "category"],
        properties: {
          name: { type: "string" },
          slug: { type: "string" },
          category: {
            type: "string",
            enum: ["TRADITIONAL", "MODERN", "RELIGIOUS"],
          },
          previewImage: { type: "string", format: "uri" },
          isActive: { type: "boolean" },
        },
      },
      CreateEventRequest: {
        type: "object",
        required: ["templateId", "title", "eventDate", "slug"],
        properties: {
          templateId: { type: "string", format: "uuid" },
          title: { type: "string" },
          brideName: { type: "string" },
          groomName: { type: "string" },
          bridePhone: { type: "string" },
          groomPhone: { type: "string" },
          eventDate: { type: "string", format: "date-time" },
          location: { type: "string" },
          description: { type: "string" },
          coverImage: { type: "string", format: "uri" },
          slug: { type: "string" },
          subdomain: { type: "string" },
          isPublished: { type: "boolean" },
        },
      },
      CreateGuestRequest: {
        type: "object",
        required: ["eventId", "name", "invitationCode"],
        properties: {
          eventId: { type: "string", format: "uuid" },
          name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          invitationCode: { type: "string" },
        },
      },
      BulkGuestRequest: {
        type: "object",
        required: ["eventId", "guests"],
        properties: {
          eventId: { type: "string", format: "uuid" },
          guests: {
            type: "array",
            items: { $ref: "#/components/schemas/CreateGuestRequest" },
          },
        },
      },
      CreateMediaRequest: {
        type: "object",
        required: ["eventId", "type", "url"],
        properties: {
          eventId: { type: "string", format: "uuid" },
          type: { type: "string", enum: ["IMAGE", "VIDEO"] },
          url: { type: "string", format: "uri" },
        },
      },
    },
  },
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with phone and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "400": { description: "Invalid request" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Clear studio session cookie",
        responses: {
          "200": { description: "Logged out" },
        },
      },
    },
    "/api/studio/templates": {
      get: {
        tags: ["Templates"],
        summary: "List templates",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "query",
            name: "includeInactive",
            schema: { type: "boolean" },
            required: false,
          },
        ],
        responses: {
          "200": {
            description: "Template list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    templates: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Template" },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Templates"],
        summary: "Create template (ADMIN only)",
        security: [{ StudioSessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTemplateRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Invalid payload" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/studio/templates/{templateId}": {
      get: {
        tags: ["Templates"],
        summary: "Get template by id",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "templateId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Template" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      patch: {
        tags: ["Templates"],
        summary: "Update template (ADMIN only)",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "templateId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTemplateRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "400": { description: "Invalid payload" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Templates"],
        summary: "Delete template (ADMIN only)",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "templateId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Deleted" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/studio/events": {
      get: {
        tags: ["Events"],
        summary: "List events for authenticated studio",
        security: [{ StudioSessionCookie: [] }],
        responses: {
          "200": { description: "Event list" },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Events"],
        summary: "Create event",
        security: [{ StudioSessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateEventRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Invalid payload" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/studio/events/{eventId}": {
      get: {
        tags: ["Events"],
        summary: "Get event detail",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "eventId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Event detail" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      patch: {
        tags: ["Events"],
        summary: "Update event",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "eventId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateEventRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "400": { description: "Invalid payload" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Events"],
        summary: "Delete event",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "eventId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Deleted" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/studio/guests": {
      get: {
        tags: ["Guests"],
        summary: "List guests for an event",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "query",
            name: "eventId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Guest list" },
          "400": { description: "Missing eventId" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      post: {
        tags: ["Guests"],
        summary: "Create guest",
        security: [{ StudioSessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateGuestRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Invalid payload" },
          "401": { description: "Unauthorized" },
          "404": { description: "Event not found" },
        },
      },
    },
    "/api/studio/guests/bulk": {
      post: {
        tags: ["Guests"],
        summary: "Bulk create guests",
        security: [{ StudioSessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BulkGuestRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Invalid payload" },
          "401": { description: "Unauthorized" },
          "404": { description: "Event not found" },
        },
      },
    },
    "/api/studio/guests/{guestId}": {
      get: {
        tags: ["Guests"],
        summary: "Get guest detail",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "guestId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Guest detail" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      patch: {
        tags: ["Guests"],
        summary: "Update guest",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "guestId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateGuestRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "400": { description: "Invalid payload" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Guests"],
        summary: "Delete guest",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "guestId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Deleted" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/studio/guests/{guestId}/check-in": {
      patch: {
        tags: ["Guests"],
        summary: "Check in guest",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "guestId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Checked in" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/studio/media": {
      get: {
        tags: ["Media"],
        summary: "List media for an event",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "query",
            name: "eventId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Media list" },
          "400": { description: "Missing eventId" },
          "401": { description: "Unauthorized" },
          "404": { description: "Event not found" },
        },
      },
      post: {
        tags: ["Media"],
        summary: "Create media record",
        security: [{ StudioSessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateMediaRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Invalid payload" },
          "401": { description: "Unauthorized" },
          "404": { description: "Event not found" },
        },
      },
    },
    "/api/studio/media/{mediaId}": {
      get: {
        tags: ["Media"],
        summary: "Get media detail",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "mediaId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Media detail" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      patch: {
        tags: ["Media"],
        summary: "Update media",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "mediaId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateMediaRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "400": { description: "Invalid payload" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Media"],
        summary: "Delete media",
        security: [{ StudioSessionCookie: [] }],
        parameters: [
          {
            in: "path",
            name: "mediaId",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": { description: "Deleted" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
        },
      },
    },
  },
} as const;
