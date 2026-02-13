type OpenApiOperation = {
  summary?: string;
  description?: string;
  requestBody?: {
    content?: {
      "application/json"?: {
        schema?: unknown;
      };
    };
  };
};

type OpenApiDoc = {
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  paths?: Record<string, Record<string, OpenApiOperation>>;
};

function pathToPostmanPath(path: string) {
  return path.replace(/\{([^}]+)\}/g, ":$1");
}

function operationToItem(path: string, method: string, operation: OpenApiOperation) {
  const methodUpper = method.toUpperCase();
  const postmanPath = pathToPostmanPath(path);
  const request: {
    method: string;
    header: Array<{ key: string; value: string }>;
    url: {
      raw: string;
      host: string[];
      path: string[];
    };
    description?: string;
    body?: {
      mode: "raw";
      raw: string;
      options: {
        raw: {
          language: "json";
        };
      };
    };
  } = {
    method: methodUpper,
    header: [],
    url: {
      raw: "{{baseUrl}}" + postmanPath,
      host: ["{{baseUrl}}"],
      path: postmanPath.replace(/^\//, "").split("/"),
    },
    description: operation.description ?? operation.summary,
  };

  const hasJsonBody = Boolean(operation.requestBody?.content?.["application/json"]);

  if (["POST", "PATCH", "PUT"].includes(methodUpper) && hasJsonBody) {
    request.header.push({ key: "Content-Type", value: "application/json" });
    request.body = {
      mode: "raw",
      raw: "{}",
      options: {
        raw: {
          language: "json",
        },
      },
    };
  }

  return {
    name: operation.summary ?? `${methodUpper} ${path}`,
    request,
    response: [],
  };
}

export function buildPostmanCollection(openApiDoc: OpenApiDoc) {
  const items: Array<{
    name: string;
    item: Array<ReturnType<typeof operationToItem>>;
  }> = [];

  const groupMap = new Map<string, Array<ReturnType<typeof operationToItem>>>();

  for (const [path, operations] of Object.entries(openApiDoc.paths ?? {})) {
    for (const [method, operation] of Object.entries(operations)) {
      const item = operationToItem(path, method, operation);
      const topLevelGroup = path.split("/")[2] ?? "misc";
      const existing = groupMap.get(topLevelGroup) ?? [];
      existing.push(item);
      groupMap.set(topLevelGroup, existing);
    }
  }

  for (const [groupName, groupItems] of groupMap.entries()) {
    items.push({
      name: groupName.toUpperCase(),
      item: groupItems,
    });
  }

  return {
    info: {
      name: openApiDoc.info?.title ?? "API Collection",
      description: openApiDoc.info?.description ?? "Generated from OpenAPI",
      version: openApiDoc.info?.version ?? "1.0.0",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: items,
    variable: [
      {
        key: "baseUrl",
        value: "http://localhost:3000",
      },
    ],
  };
}
