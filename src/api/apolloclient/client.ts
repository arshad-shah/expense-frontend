/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  from,
  NormalizedCacheObject,
  FieldPolicy,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { setContext } from '@apollo/client/link/context';
import { ApolloConfig } from '@/types';

// Cache configuration with field policies
const createCache = () => {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          paginatedItems: {
            keyArgs: ['filter'],
            merge(existing: readonly unknown[] = [], incoming: readonly unknown[], { args }: { args?: { offset?: number } }) {
              if (args?.offset) {
                return [...existing, ...incoming];
              }
              return incoming;
            },
          } as FieldPolicy<unknown[], unknown[], { offset?: number }>,
        },
      },
    },
  });
};

// Create a retry link for failed requests
const createRetryLink = (attempts: number = 3) => {
  return new RetryLink({
    attempts: {
      max: attempts,
      retryIf: (error: any) => {
        return !!error && (error.statusCode === undefined || error.statusCode >= 500);
      },
    },
    delay: {
      initial: 300,
      max: 3000,
      jitter: true,
    },
  });
};

// Create an auth link for handling authentication
const createAuthLink = (getToken: () => string | null) => {
  return setContext((_, { headers }) => {
    const token = getToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });
};

// Create an error handling link
const createErrorLink = (
  errorCallback?: (error: Error) => void,
  tokenRefreshEndpoint?: string,
  onTokenRefresh?: (newToken: string) => void,
) => {
  return onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        // Handle specific GraphQL errors
        switch (err.extensions?.code) {
          case 'UNAUTHENTICATED':
            // Handle token refresh if endpoint is provided
            if (tokenRefreshEndpoint && onTokenRefresh) {
              (async () => {
                try {
                  const response = await fetch(tokenRefreshEndpoint, {
                    method: 'POST',
                    credentials: 'include',
                  });
                  const { token } = await response.json();
                  
                  // Update token in storage/memory
                  onTokenRefresh(token);
                  
                  // Retry the failed request
                  const oldHeaders = operation.getContext().headers;
                  operation.setContext({
                    headers: {
                      ...oldHeaders,
                      authorization: `Bearer ${token}`,
                    },
                  });
                  forward(operation).subscribe({
                    next: () => {},
                    error: () => {},
                  });
                } catch (error) {
                  // Token refresh failed
                  if (errorCallback) {
                    errorCallback(error instanceof Error ? error : new Error('Token refresh failed'));
                  }
                }
              })();
            }
            break;
          default:
            if (errorCallback) {
              errorCallback(new Error(err.message));
            }
        }
      }
    }

    if (networkError) {
      if (errorCallback) {
        errorCallback(networkError);
      }
    }
  });
};

// Main function to create Apollo Client instance
export const createApolloClient = ({
  uri,
  enableRetry = true,
  retryAttempts = 3,
  tokenRefreshEndpoint,
  getToken,
  onTokenRefresh,
  onError,
}: ApolloConfig): ApolloClient<NormalizedCacheObject> => {
  // Create the basic HTTP link
  const httpLink = new HttpLink({ uri });

  // Create the links array
  const links: ApolloLink[] = [];

  // Add error handling link
  links.push(createErrorLink(onError, tokenRefreshEndpoint, onTokenRefresh));

  // Add retry link if enabled
  if (enableRetry) {
    links.push(createRetryLink(retryAttempts));
  }

  // Add auth link if token getter is provided
  if (getToken) {
    links.push(createAuthLink(getToken));
  }

  // Add HTTP link last
  links.push(httpLink);

  // Create and return the Apollo Client instance
  return new ApolloClient({
    link: from(links),
    cache: createCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
};