namespace WebApplication01.Application.DTOs;

/// <summary>
/// Base response wrapper
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public List<ErrorDetail>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public static ApiResponse<T> SuccessResponse(T data)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data
        };
    }
    
    public static ApiResponse<T> ErrorResponse(List<ErrorDetail> errors)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Errors = errors
        };
    }
    
    public static ApiResponse<T> ErrorResponse(string field, string message)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Errors = new List<ErrorDetail>
            {
                new ErrorDetail { Field = field, Message = message }
            }
        };
    }
}

public class ErrorDetail
{
    public string Field { get; set; } = null!;
    public string Message { get; set; } = null!;
}

/// <summary>
/// Paginated response wrapper
/// </summary>
public class PagedResponse<T>
{
    public bool Success { get; set; } = true;
    public List<T> Data { get; set; } = new();
    public PaginationMetadata Metadata { get; set; } = null!;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class PaginationMetadata
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}
