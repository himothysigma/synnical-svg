/**
 * Games/Stratus Error Handling Utility
 * 
 * #13 - Hardened error handling for Games subsystem
 * Prevents raw HTML, stack traces, and "Unknown error" from showing in UI
 * 
 * Implementation follows handoff requirements:
 * - Inspect HTTP status
 * - Inspect Content-Type  
 * - Parse JSON only when JSON
 * - Handle text/HTML separately
 * - Map backend errors to user-friendly messages
 */

export interface GameApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: GameApiError;
  statusCode: number;
  contentType: string;
}

export interface GameApiError {
  code: string;
  message: string; // User-friendly message
  technical?: string; // Internal detail for logging
  recoverable: boolean;
}

// Error code to user-facing message mapping
const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  'NETWORK_ERROR': 'Unable to connect to game servers. Please check your internet connection.',
  'TIMEOUT': 'The request timed out. Please try again.',
  'CORS_BLOCKED': 'Connection blocked by security policy.',
  
  // Client errors (4xx)
  'UNAUTHORIZED': 'Please log in to play games.',
  'FORBIDDEN': 'You don\'t have permission to access this game.',
  'NOT_FOUND': 'This game is currently unavailable.',
  'QUEUE_FULL': 'Game queue is full. Please try again in a moment.',
  'INVALID_SESSION': 'Your session has expired. Please refresh.',
  'ALLOCATION_FAILED': 'Unable to start game session. The game server may be busy.',
  
  // Server errors (5xx)
  'SERVER_ERROR': 'Game servers are experiencing issues. Please try again later.',
  'SERVICE_UNAVAILABLE': 'Game services are temporarily down for maintenance.',
  'GATEWAY_TIMEOUT': 'Servers are responding slowly. Please wait a moment.',
  
  // Stratus-specific
  'STRATUS_DISABLED': 'Cloud gaming is currently unavailable.',
  'PROVIDER_TIMEOUT': 'Game provider timed out while starting.',
  'POOL_EXHAUSTED': 'All game sessions are in use. Please try again soon.',
  
  // Generic fallbacks
  'UNKNOWN': 'Something went wrong. Please try again.',
  'PARSE_ERROR': 'Received an invalid response from servers.',
};

/**
 * Safely fetch from Games API with proper error handling
 */
export async function gamesFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<GameApiResponse<T>> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Synnical-Client': 'svg',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options?.headers },
    });

    const contentType = response.headers.get('content-type') || '';
    const statusCode = response.status;

    // #13 - Handle non-JSON responses (HTML error pages, etc.)
    if (!contentType.includes('application/json')) {
      // Check for HTML responses that should never be shown to users
      if (contentType.includes('text/html') || contentType.includes('html')) {
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: ERROR_MESSAGES['PARSE_ERROR'],
            technical: `Received HTML response (${statusCode}) when expecting JSON`,
            recoverable: true,
          },
          statusCode,
          contentType,
        };
      }

      // Try to parse as text for other content types
      const text = await response.text();
      return {
        success: false,
        error: {
          code: 'UNSUPPORTED_FORMAT',
          message: 'Received an unexpected response format.',
          technical: `Content-Type: ${contentType}`,
          recoverable: true,
        },
        statusCode,
        contentType,
      };
    }

    // Parse JSON response
    let data: T;
    try {
      data = await response.json();
    } catch (parseError) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: ERROR_MESSAGES['PARSE_ERROR'],
          technical: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          recoverable: true,
        },
        statusCode,
        contentType,
      };
    }

    // Handle HTTP error status codes with JSON body
    if (!response.ok) {
      const errorCode = (data as Record<string, unknown>)?.code as string || getErrorCodeFromStatus(statusCode);
      
      return {
        success: false,
        error: {
          code: errorCode,
          message: (data as Record<string, unknown>)?.message as string || ERROR_MESSAGES[errorCode] || ERROR_MESSAGES['UNKNOWN'],
          technical: JSON.stringify(data),
          recoverable: isRecoverable(statusCode),
        },
        statusCode,
        contentType,
      };
    }

    // Success
    return {
      success: true,
      data,
      statusCode,
      contentType,
    };

  } catch (error) {
    // Network-level errors
    return handleNetworkError(error);
  }
}

/**
 * Map HTTP status codes to error codes
 */
function getErrorCodeFromStatus(status: number): string {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status >= 400 && status < 500) return 'CLIENT_ERROR';
  if (status === 502 || status === 503 || status === 504) return 'SERVER_ERROR';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN';
}

/**
 * Determine if an error is potentially recoverable
 */
function isRecoverable(statusCode: number): boolean {
  // 4xx client errors are usually recoverable by user action
  // Some 5xx errors may resolve on retry
  return statusCode < 500 || statusCode === 503 || statusCode === 504;
}

/**
 * Handle network-level errors (no response received)
 */
function handleNetworkError(error: unknown): GameApiResponse {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: ERROR_MESSAGES['NETWORK_ERROR'],
        technical: error.message,
        recoverable: true,
      },
      statusCode: 0,
      contentType: '',
    };
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      success: false,
      error: {
        code: 'TIMEOUT',
        message: ERROR_MESSAGES['TIMEOUT'],
        recoverable: true,
      },
      statusCode: 0,
      contentType: '',
    };
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN',
      message: ERROR_MESSAGES['UNKNOWN'],
      technical: error instanceof Error ? error.message : 'Unknown error',
      recoverable: true,
    },
    statusCode: 0,
    contentType: '',
  };
}

/**
 * Get user-friendly error message for display
 */
export function getErrorMessage(error: GameApiError): string {
  return ERROR_MESSAGES[error.code] || error.message || ERROR_MESSAGES['UNKNOWN'];
}

/**
 * Log error details internally (not shown to user)
 */
export function logErrorInternal(response: GameApiResponse<unknown>): void {
  if (!response.error) return;
  
  console.warn('[Games API Error]', {
    code: response.error.code,
    message: response.error.message,
    technical: response.error.technical,
    statusCode: response.statusCode,
    timestamp: new Date().toISOString(),
  });
}

/**
 * React hook for safe games data fetching
 * Usage:
 * const { data, error, loading } = useGamesFetch('/api/games/catalog');
 */
export interface UseGamesFetchResult<T> {
  data: T | null;
  error: GameApiError | null;
  loading: boolean;
  refetch: () => void;
}
