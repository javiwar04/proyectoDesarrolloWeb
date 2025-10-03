using Microsoft.AspNetCore.Mvc;
using WebApi.Models;
using Swashbuckle.AspNetCore.Annotations;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ProjectsController : ControllerBase
    {
        /// <summary>
        /// Crea un nuevo proyecto con imágenes
        /// </summary>
        /// <param name="model">Datos del proyecto incluyendo imágenes</param>
        /// <returns>Confirmación de creación del proyecto</returns>
        /// <response code="200">Proyecto creado exitosamente</response>
        /// <response code="400">Datos de entrada inválidos</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(ProjectResponse), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        [SwaggerOperation(
            Summary = "Crear nuevo proyecto",
            Description = "Endpoint para crear un nuevo proyecto con archivos de imagen. Acepta datos en formato multipart/form-data."
        )]
        public async Task<IActionResult> CreateProject([FromForm] ProjectFormModel model)
        {
            try
            {
                // Validar el modelo
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Message = "Datos de entrada inválidos",
                        Errors = ModelState.Where(x => x.Value.Errors.Count > 0)
                                          .ToDictionary(
                                              kvp => kvp.Key,
                                              kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                                          )
                    });
                }

                // Validar archivos de imagen
                if (model.Images != null && model.Images.Any())
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                    var maxFileSize = 5 * 1024 * 1024; // 5MB

                    foreach (var file in model.Images)
                    {
                        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                        if (!allowedExtensions.Contains(extension))
                        {
                            return BadRequest(new ErrorResponse
                            {
                                Message = $"Tipo de archivo no permitido: {extension}. Solo se permiten: {string.Join(", ", allowedExtensions)}"
                            });
                        }

                        if (file.Length > maxFileSize)
                        {
                            return BadRequest(new ErrorResponse
                            {
                                Message = $"El archivo {file.FileName} excede el tamaño máximo de 5MB"
                            });
                        }
                    }
                }

                // Aquí iría la lógica para guardar el proyecto y las imágenes
                // Por ejemplo: guardar en base de datos, subir imágenes a almacenamiento, etc.
                
                var projectId = await SaveProjectAsync(model);
                
                return Ok(new ProjectResponse
                {
                    Id = projectId,
                    Message = "Proyecto creado correctamente",
                    Title = model.Title,
                    CreatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                // Log del error
                return StatusCode(500, new ErrorResponse
                {
                    Message = "Error interno del servidor",
                    Details = ex.Message
                });
            }
        }

        /// <summary>
        /// Obtiene un proyecto por su ID
        /// </summary>
        /// <param name="id">ID del proyecto</param>
        /// <returns>Datos del proyecto</returns>
        /// <response code="200">Proyecto encontrado</response>
        /// <response code="404">Proyecto no encontrado</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(ProjectDetailResponse), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 404)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        [SwaggerOperation(
            Summary = "Obtener proyecto por ID",
            Description = "Obtiene los detalles completos de un proyecto específico por su ID."
        )]
        public async Task<IActionResult> GetProject(int id)
        {
            try
            {
                var project = await GetProjectByIdAsync(id);
                
                if (project == null)
                {
                    return NotFound(new ErrorResponse
                    {
                        Message = $"No se encontró el proyecto con ID {id}"
                    });
                }

                return Ok(project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Message = "Error interno del servidor",
                    Details = ex.Message
                });
            }
        }

        /// <summary>
        /// Obtiene todos los proyectos con paginación
        /// </summary>
        /// <param name="page">Número de página (por defecto 1)</param>
        /// <param name="pageSize">Tamaño de página (por defecto 10, máximo 50)</param>
        /// <param name="search">Término de búsqueda opcional</param>
        /// <returns>Lista paginada de proyectos</returns>
        /// <response code="200">Lista de proyectos obtenida exitosamente</response>
        /// <response code="400">Parámetros de paginación inválidos</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpGet]
        [ProducesResponseType(typeof(ProjectListResponse), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        [SwaggerOperation(
            Summary = "Obtener lista de proyectos",
            Description = "Obtiene una lista paginada de todos los proyectos con opción de búsqueda."
        )]
        public async Task<IActionResult> GetProjects(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            try
            {
                if (page < 1)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Message = "El número de página debe ser mayor a 0"
                    });
                }

                if (pageSize < 1 || pageSize > 50)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Message = "El tamaño de página debe estar entre 1 y 50"
                    });
                }

                var result = await GetProjectsAsync(page, pageSize, search);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Message = "Error interno del servidor",
                    Details = ex.Message
                });
            }
        }

        /// <summary>
        /// Actualiza un proyecto existente
        /// </summary>
        /// <param name="id">ID del proyecto a actualizar</param>
        /// <param name="model">Nuevos datos del proyecto</param>
        /// <returns>Proyecto actualizado</returns>
        /// <response code="200">Proyecto actualizado exitosamente</response>
        /// <response code="400">Datos de entrada inválidos</response>
        /// <response code="404">Proyecto no encontrado</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(ProjectResponse), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 404)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        [SwaggerOperation(
            Summary = "Actualizar proyecto",
            Description = "Actualiza un proyecto existente. Puede incluir nuevas imágenes."
        )]
        public async Task<IActionResult> UpdateProject(int id, [FromForm] ProjectFormModel model)
        {
            try
            {
                var existingProject = await GetProjectByIdAsync(id);
                if (existingProject == null)
                {
                    return NotFound(new ErrorResponse
                    {
                        Message = $"No se encontró el proyecto con ID {id}"
                    });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Message = "Datos de entrada inválidos",
                        Errors = ModelState.Where(x => x.Value.Errors.Count > 0)
                                          .ToDictionary(
                                              kvp => kvp.Key,
                                              kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                                          )
                    });
                }

                var updatedProject = await UpdateProjectAsync(id, model);
                
                return Ok(new ProjectResponse
                {
                    Id = updatedProject.Id,
                    Message = "Proyecto actualizado correctamente",
                    Title = updatedProject.Title,
                    CreatedAt = updatedProject.CreatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Message = "Error interno del servidor",
                    Details = ex.Message
                });
            }
        }

        /// <summary>
        /// Elimina un proyecto
        /// </summary>
        /// <param name="id">ID del proyecto a eliminar</param>
        /// <returns>Confirmación de eliminación</returns>
        /// <response code="200">Proyecto eliminado exitosamente</response>
        /// <response code="404">Proyecto no encontrado</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(DeleteResponse), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 404)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        [SwaggerOperation(
            Summary = "Eliminar proyecto",
            Description = "Elimina un proyecto y todos sus archivos asociados."
        )]
        public async Task<IActionResult> DeleteProject(int id)
        {
            try
            {
                var project = await GetProjectByIdAsync(id);
                if (project == null)
                {
                    return NotFound(new ErrorResponse
                    {
                        Message = $"No se encontró el proyecto con ID {id}"
                    });
                }

                await DeleteProjectAsync(id);
                
                return Ok(new DeleteResponse
                {
                    Message = "Proyecto eliminado correctamente",
                    DeletedId = id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Message = "Error interno del servidor",
                    Details = ex.Message
                });
            }
        }

        // Métodos privados para la lógica de negocio
        private async Task<int> SaveProjectAsync(ProjectFormModel model)
        {
            // Implementar lógica de guardado
            await Task.Delay(100); // Simular operación async
            return new Random().Next(1, 1000);
        }

        private async Task<ProjectDetailResponse?> GetProjectByIdAsync(int id)
        {
            // Implementar lógica de búsqueda
            await Task.Delay(100);
            return new ProjectDetailResponse
            {
                Id = id,
                Title = "Proyecto de ejemplo",
                Description = "Descripción del proyecto",
                Technologies = new[] { "React", "Node.js" },
                Images = new[] { "image1.jpg", "image2.jpg" },
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                DemoUrl = "https://demo.example.com",
                CodeUrl = "https://github.com/example/project"
            };
        }

        private async Task<ProjectListResponse> GetProjectsAsync(int page, int pageSize, string? search)
        {
            // Implementar lógica de paginación y búsqueda
            await Task.Delay(100);
            return new ProjectListResponse
            {
                Data = new List<ProjectSummary>(),
                TotalCount = 0,
                Page = page,
                PageSize = pageSize,
                TotalPages = 0
            };
        }

        private async Task<ProjectDetailResponse> UpdateProjectAsync(int id, ProjectFormModel model)
        {
            // Implementar lógica de actualización
            await Task.Delay(100);
            return new ProjectDetailResponse
            {
                Id = id,
                Title = model.Title,
                Description = model.Description,
                Technologies = model.Technologies?.Split(',') ?? Array.Empty<string>(),
                Images = Array.Empty<string>(),
                CreatedAt = DateTime.UtcNow
            };
        }

        private async Task DeleteProjectAsync(int id)
        {
            // Implementar lógica de eliminación
            await Task.Delay(100);
        }
    }
}